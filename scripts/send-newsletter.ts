/**
 * CLI script to send a newsletter email to all subscribers
 * 
 * Usage:
 *   npx tsx scripts/send-newsletter.ts <filename> [--test <email>]
 * 
 * Examples:
 *   npx tsx scripts/send-newsletter.ts example-newsletter
 *   npx tsx scripts/send-newsletter.ts example-newsletter --test user@example.com
 * 
 * Note: Filename should be without the .mdx extension
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { sendNewsletterToSubscribers, sendNewsletterToSubscriber, getAllNewsletterFiles } from "../lib/email-newsletter";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("Error: Newsletter filename is required");
    console.error("\nUsage:");
    console.error("  npx tsx scripts/send-newsletter.ts <filename> [--test <email>]");
    console.error("\nExamples:");
    console.error("  npx tsx scripts/send-newsletter.ts example-newsletter");
    console.error("  npx tsx scripts/send-newsletter.ts example-newsletter --test user@example.com");
    console.error("\nAvailable newsletters:");
    const newsletters = getAllNewsletterFiles();
    if (newsletters.length === 0) {
      console.error("  (no newsletters found)");
    } else {
      newsletters.forEach((file) => {
        const name = file.replace(/\.mdx$/, "");
        console.error(`  - ${name}`);
      });
    }
    process.exit(1);
  }

  const filename = args[0];
  const testIndex = args.indexOf("--test");
  const testEmail = testIndex !== -1 && args[testIndex + 1] ? args[testIndex + 1] : null;

  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    console.error("Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not set");
    process.exit(1);
  }

  try {
    if (testEmail) {
      // Send to single test email
      console.log(`Sending newsletter "${filename}" to test email: ${testEmail}...`);
      await sendNewsletterToSubscriber(filename, testEmail, convexUrl);
      console.log("✅ Email sent successfully!");
    } else {
      // Send to all subscribers
      console.log(`Sending newsletter "${filename}" to all active subscribers...`);
      const result = await sendNewsletterToSubscribers(filename, convexUrl);
      
      if (result.success) {
        console.log(`✅ Successfully sent ${result.sentCount} email(s)`);
        if (result.errorCount > 0) {
          console.warn(`⚠️  ${result.errorCount} email(s) failed`);
          if (result.errors) {
            result.errors.forEach((err) => {
              console.error(`  - ${err.email}: ${err.error}`);
            });
          }
        }
      } else {
        console.error(`❌ Failed to send emails`);
        if (result.errors) {
          result.errors.forEach((err) => {
            console.error(`  - ${err.email}: ${err.error}`);
          });
        }
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("❌ Error sending newsletter email:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
