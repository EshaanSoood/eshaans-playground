/**
 * Script to import subscribers from CSV file into Convex
 * 
 * IMPORTANT: This script does NOT send any emails - it only imports subscribers
 * 
 * Usage:
 *   npx tsx scripts/import-subscribers.ts <path-to-csv-file>
 * 
 * Example:
 *   npx tsx scripts/import-subscribers.ts subscriber-export-2026-01-23-09-36-48.csv
 * 
 * CSV Format expected:
 *   - First row should be headers (email, name, etc.)
 *   - Email column is required
 *   - Name column is optional
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });
const vercelEnvPath = resolve(__dirname, '../.env.vercel');
if (fs.existsSync(vercelEnvPath)) {
  dotenv.config({ path: vercelEnvPath });
}

interface SubscriberRow {
  email: string;
  name?: string;
  source?: string;
}

function parseCSV(filePath: string): SubscriberRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header row
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const emailIndex = headers.findIndex(h => h === 'email' || h === 'e-mail' || h === 'email address');
  
  if (emailIndex === -1) {
    throw new Error('CSV file must have an "email" column');
  }

  const nameIndex = headers.findIndex(h => h === 'name' || h === 'full name' || h === 'fullname');
  const sourceIndex = headers.findIndex(h => h === 'source' || h === 'origin');

  const subscribers: SubscriberRow[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length <= emailIndex) {
      continue; // Skip malformed rows
    }

    const email = values[emailIndex]?.toLowerCase().trim();
    
    if (!email || !email.includes('@')) {
      console.warn(`⚠️  Skipping row ${i + 1}: invalid email "${email}"`);
      continue;
    }

    const subscriber: SubscriberRow = {
      email,
    };

    if (nameIndex !== -1 && values[nameIndex]) {
      subscriber.name = values[nameIndex];
    }

    if (sourceIndex !== -1 && values[sourceIndex]) {
      subscriber.source = values[sourceIndex];
    } else {
      subscriber.source = 'csv-import';
    }

    subscribers.push(subscriber);
  }

  return subscribers;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: CSV file path is required');
    console.error('\nUsage:');
    console.error('  npx tsx scripts/import-subscribers.ts <path-to-csv-file>');
    console.error('\nExample:');
    console.error('  npx tsx scripts/import-subscribers.ts subscriber-export-2026-01-23-09-36-48.csv');
    process.exit(1);
  }

  const csvPath = args[0];
  const fullPath = path.isAbsolute(csvPath) ? csvPath : path.join(process.cwd(), csvPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`Error: CSV file not found: ${fullPath}`);
    process.exit(1);
  }

  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    console.error('Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not set.');
    process.exit(1);
  }

  console.log('📋 Importing subscribers from CSV file...');
  console.log(`   File: ${fullPath}\n`);

  try {
    // Parse CSV
    const subscribers = parseCSV(fullPath);
    console.log(`✅ Parsed ${subscribers.length} subscriber(s) from CSV\n`);

    if (subscribers.length === 0) {
      console.error('No valid subscribers found in CSV file');
      process.exit(1);
    }

    // Connect to Convex
    const convex = new ConvexHttpClient(convexUrl);

    let added = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ email: string; error: string }> = [];

    // Import each subscriber
    for (const subscriber of subscribers) {
      try {
        // Check if subscriber already exists
        const existing = await convex.query(api.subscribers.getSubscriberByEmail, {
          email: subscriber.email,
        });

        if (existing) {
          // Update existing subscriber if they were unsubscribed
          if (existing.status === 'unsubscribed') {
            await convex.mutation(api.subscribers.addSubscriber, {
              email: subscriber.email,
              name: subscriber.name,
              source: subscriber.source,
            });
            updated++;
            console.log(`   ✅ Reactivated: ${subscriber.email}`);
          } else {
            skipped++;
            console.log(`   ⏭️  Already exists: ${subscriber.email}`);
          }
        } else {
          // Add new subscriber
          const result = await convex.mutation(api.subscribers.addSubscriber, {
            email: subscriber.email,
            name: subscriber.name,
            source: subscriber.source,
          });

          if (result) {
            added++;
            console.log(`   ✅ Added: ${subscriber.email}${subscriber.name ? ` (${subscriber.name})` : ''}`);
          } else {
            skipped++;
            console.log(`   ⏭️  Skipped: ${subscriber.email} (already exists)`);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ email: subscriber.email, error: errorMsg });
        console.error(`   ❌ Error importing ${subscriber.email}: ${errorMsg}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Import complete!');
    console.log(`   ✅ Added: ${added}`);
    console.log(`   🔄 Reactivated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    if (errors.length > 0) {
      console.log(`   ❌ Errors: ${errors.length}`);
    }
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(({ email, error }) => {
        console.log(`   - ${email}: ${error}`);
      });
    }

    console.log('\n⚠️  IMPORTANT: No emails were sent during this import.');
    console.log('   Subscribers are now in your database and ready to receive future emails.');
  } catch (error) {
    console.error('❌ Failed to import subscribers:', error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
