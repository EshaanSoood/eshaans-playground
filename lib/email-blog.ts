/**
 * Functions for sending blog post emails to subscribers
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { getPostBySlug, type Post } from "./content";
import { mdxToEmailHtml } from "./mdx-to-email";
import { generateBlogPostEmail, generatePlainTextFromHtml } from "./email-templates";
import { sendBatchEmails, sendEmail } from "./email";

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
 * Send a blog post to all active subscribers
 * 
 * @param slug - The slug of the blog post to send
 * @param convexUrl - Convex URL (optional, will use env var if not provided)
 * @returns Result with success status and details
 */
export async function sendBlogPostToSubscribers(
  slug: string,
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
    // Fetch the blog post
    const post = await getPostBySlug(slug);
    
    if (!post) {
      throw new Error(`Blog post with slug "${slug}" not found`);
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
    const contentHtml = await mdxToEmailHtml(post.content);

    // Prepare email messages for batch sending
    const messages = subscribers.map((subscriber) => {
      const htmlBody = generateBlogPostEmail({
        title: post.title,
        date: post.date,
        contentHtml,
        slug: post.slug,
        subscriberEmail: subscriber.email,
      });

      const textBody = generatePlainTextFromHtml(htmlBody);

      return {
        to: subscriber.email,
        subject: `New Blog Post: ${post.title}`,
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
    console.error("Error sending blog post email:", error);
    throw error;
  }
}

/**
 * Send a blog post to a single subscriber (for testing)
 * 
 * @param slug - The slug of the blog post to send
 * @param email - Email address of the recipient
 * @param convexUrl - Convex URL (optional, will use env var if not provided)
 */
export async function sendBlogPostToSubscriber(
  slug: string,
  email: string,
  convexUrl?: string
): Promise<void> {
  const url = convexUrl || process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!url) {
    throw new Error("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }

  // Fetch the blog post
  const post = await getPostBySlug(slug);
  
  if (!post) {
    throw new Error(`Blog post with slug "${slug}" not found`);
  }

  // Convert MDX content to HTML
  const contentHtml = await mdxToEmailHtml(post.content);

  // Generate email HTML
  const htmlBody = generateBlogPostEmail({
    title: post.title,
    date: post.date,
    contentHtml,
    slug: post.slug,
    subscriberEmail: email,
  });

  const textBody = generatePlainTextFromHtml(htmlBody);

  // Send email via Postmark
  await sendEmail({
    to: email,
    subject: `New Blog Post: ${post.title}`,
    htmlBody,
    textBody,
  });
}
