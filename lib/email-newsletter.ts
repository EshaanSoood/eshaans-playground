/**
 * Functions for reading and sending newsletter emails to subscribers
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { mdxToEmailHtml } from "./mdx-to-email";
import { generateNewsletterEmail, generatePlainTextFromHtml } from "./email-templates";
import { sendBatchEmails, sendEmail } from "./email";

export interface NewsletterData {
  title: string;
  date: string;
  subject: string;
  content: string;
  slug: string;
}

/**
 * Get all newsletter files from the newsletters directory
 */
export function getAllNewsletterFiles(): string[] {
  const newslettersDirectory = path.join(process.cwd(), 'newsletters');
  
  if (!fs.existsSync(newslettersDirectory)) {
    return [];
  }
  
  return fs.readdirSync(newslettersDirectory).filter((file) => file.endsWith('.mdx'));
}

/**
 * Get newsletter data by filename (without .mdx extension)
 */
export function getNewsletterData(filename: string): NewsletterData | null {
  const newslettersDirectory = path.join(process.cwd(), 'newsletters');
  const filePath = path.join(newslettersDirectory, `${filename}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    title: data.title || '',
    date: data.date || new Date().toISOString().split('T')[0],
    subject: data.subject || data.title || 'Newsletter',
    content,
    slug: filename,
  };
}

/**
 * Get all active subscribers
 */
async function getActiveSubscribers(convexUrl: string) {
  const convex = new ConvexHttpClient(convexUrl);
  const subscribers = await convex.query(api.subscribers.getAllSubscribers, {
    status: "active",
  });
  return subscribers;
}

/**
 * Send a newsletter to all active subscribers
 * 
 * @param filename - The filename of the newsletter (without .mdx extension)
 * @param convexUrl - Convex URL (optional, will use env var if not provided)
 * @returns Result with success status and details
 */
export async function sendNewsletterToSubscribers(
  filename: string,
  convexUrl?: string
): Promise<{
  success: boolean;
  sentCount: number;
  errorCount: number;
  errors?: Array<{ email: string; error: string }>;
}> {
  const url = convexUrl || process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!url) {
    throw new Error("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }

  try {
    // Read the newsletter file
    const newsletter = getNewsletterData(filename);
    
    if (!newsletter) {
      throw new Error(`Newsletter "${filename}" not found`);
    }

    // Get all active subscribers
    const subscribers = await getActiveSubscribers(url);
    
    if (subscribers.length === 0) {
      console.log("No active subscribers found");
      return {
        success: true,
        sentCount: 0,
        errorCount: 0,
      };
    }

    // Convert MDX content to HTML
    const contentHtml = await mdxToEmailHtml(newsletter.content);

    // Prepare email messages for batch sending
    const messages = subscribers.map((subscriber) => {
      const htmlBody = generateNewsletterEmail({
        title: newsletter.title,
        date: newsletter.date,
        contentHtml,
        subscriberEmail: subscriber.email,
      });

      const textBody = generatePlainTextFromHtml(htmlBody);

      return {
        to: subscriber.email,
        subject: newsletter.subject,
        htmlBody,
        textBody,
      };
    });

    // Send batch emails via Postmark
    const result = await sendBatchEmails(messages);

    // Process results
    const errors: Array<{ email: string; error: string }> = [];
    let sentCount = 0;
    let errorCount = 0;

    result.messages.forEach((msg) => {
      if (msg.errorCode === 0) {
        sentCount++;
      } else {
        errorCount++;
        errors.push({
          email: msg.to || "unknown",
          error: msg.message || `Error code: ${msg.errorCode}`,
        });
      }
    });

    return {
      success: errorCount === 0,
      sentCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error sending newsletter email:", error);
    throw error;
  }
}

/**
 * Send a newsletter to a single subscriber (for testing)
 * 
 * @param filename - The filename of the newsletter (without .mdx extension)
 * @param email - Email address of the recipient
 * @param convexUrl - Convex URL (optional, will use env var if not provided)
 */
export async function sendNewsletterToSubscriber(
  filename: string,
  email: string,
  convexUrl?: string
): Promise<void> {
  const url = convexUrl || process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!url) {
    throw new Error("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }

  // Read the newsletter file
  const newsletter = getNewsletterData(filename);
  
  if (!newsletter) {
    throw new Error(`Newsletter "${filename}" not found`);
  }

  // Convert MDX content to HTML
  const contentHtml = await mdxToEmailHtml(newsletter.content);

  // Generate email HTML
  const htmlBody = generateNewsletterEmail({
    title: newsletter.title,
    date: newsletter.date,
    contentHtml,
    subscriberEmail: email,
  });

  const textBody = generatePlainTextFromHtml(htmlBody);

  // Send email via Postmark
  await sendEmail({
    to: email,
    subject: newsletter.subject,
    htmlBody,
    textBody,
  });
}
