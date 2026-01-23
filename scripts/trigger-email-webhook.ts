/**
 * Script to trigger the email webhook for a blog post
 * 
 * Usage:
 *   npx tsx scripts/trigger-email-webhook.ts <slug> [--url <webhook-url>]
 * 
 * Examples:
 *   npx tsx scripts/trigger-email-webhook.ts what-is-the-opposite-of-happiness
 *   npx tsx scripts/trigger-email-webhook.ts my-post-slug --url https://blog.eshaansood.in/api/email/new-post
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });
// Also load from Vercel env if available
const vercelEnvPath = resolve(__dirname, '../.env.vercel');
if (fs.existsSync(vercelEnvPath)) {
  dotenv.config({ path: vercelEnvPath });
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: Blog post slug is required');
    console.error('\nUsage:');
    console.error('  npx tsx scripts/trigger-email-webhook.ts <slug> [--url <webhook-url>]');
    console.error('\nExamples:');
    console.error('  npx tsx scripts/trigger-email-webhook.ts what-is-the-opposite-of-happiness');
    console.error('  npx tsx scripts/trigger-email-webhook.ts my-post --url https://blog.eshaansood.in/api/email/new-post');
    process.exit(1);
  }

  const slug = args[0];
  const urlIndex = args.indexOf('--url');
  const webhookUrl = urlIndex !== -1 && args[urlIndex + 1] 
    ? args[urlIndex + 1]
    : process.env.NEXT_PUBLIC_BLOG_URL 
      ? `${process.env.NEXT_PUBLIC_BLOG_URL}/api/email/new-post`
      : 'https://blog.eshaansood.in/api/email/new-post';

  const webhookSecret = process.env.WEBHOOK_SECRET;

  console.log(`📧 Triggering email webhook for post: ${slug}`);
  console.log(`🌐 Webhook URL: ${webhookUrl}\n`);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (webhookSecret) {
      headers['Authorization'] = `Bearer ${webhookSecret}`;
      console.log('✅ Using WEBHOOK_SECRET for authentication');
    } else {
      console.warn('⚠️  WEBHOOK_SECRET not set - webhook may reject the request');
    }

    const body: { slug: string; webhookSecret?: string } = { slug };
    if (webhookSecret) {
      body.webhookSecret = webhookSecret;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Email webhook triggered successfully!');
      console.log(`   Sent to ${result.sentCount || 0} subscribers`);
      if (result.errorCount > 0) {
        console.warn(`   ⚠️  ${result.errorCount} errors occurred`);
      }
      if (result.sentAt) {
        console.log(`   Sent at: ${result.sentAt}`);
      }
    } else {
      console.error('\n❌ Email webhook failed:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${result.error || result.message || 'Unknown error'}`);
      if (result.errors) {
        result.errors.forEach((err: { email: string; error: string }) => {
          console.error(`   - ${err.email}: ${err.error}`);
        });
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Failed to trigger webhook:', error);
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
