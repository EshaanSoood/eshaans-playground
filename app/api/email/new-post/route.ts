/**
 * API route for sending email notifications when a new post is published
 * 
 * This endpoint is called via webhook when a post status changes to "published"
 * 
 * POST /api/email/new-post
 * 
 * Body:
 *   - slug: string (required) - The slug of the post to send emails for
 *   - webhookSecret: string (optional) - Secret key for webhook authentication
 * 
 * Environment variables:
 *   - WEBHOOK_SECRET - Secret key for webhook authentication (optional but recommended)
 *   - POSTMARK_SERVER_API_TOKEN - Postmark API token
 *   - POSTMARK_FROM_EMAIL - From email address
 *   - CONVEX_URL or NEXT_PUBLIC_CONVEX_URL - Convex deployment URL
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { sendBlogPostToSubscribers } from "@/lib/email-blog";

function verifyWebhookSecret(request: NextRequest): boolean {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  // If no secret is configured, allow requests (for development)
  // In production, you should always set WEBHOOK_SECRET
  if (!webhookSecret) {
    console.warn("⚠️  WEBHOOK_SECRET not set - webhook authentication disabled");
    return true;
  }
  
  // Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${webhookSecret}`) {
    return true;
  }
  
  // Also check body for webhookSecret field (for CMS integrations)
  // Note: This requires reading the body, which we'll do in the handler
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { slug, webhookSecret: bodySecret } = body;
    
    // Validate slug
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'slug' parameter" },
        { status: 400 }
      );
    }
    
    // Verify webhook secret
    const authHeader = request.headers.get("authorization");
    const webhookSecret = process.env.WEBHOOK_SECRET?.trim();
    
    if (webhookSecret) {
      const providedSecret = authHeader?.replace(/^Bearer\s+/i, '').trim();
      const isValidAuth = providedSecret === webhookSecret;
      const isValidBody = bodySecret?.trim() === webhookSecret;
      
      if (!isValidAuth && !isValidBody) {
        console.error("Webhook secret mismatch:", {
          expectedLength: webhookSecret.length,
          providedLength: providedSecret?.length || 0,
          bodySecretLength: bodySecret?.trim()?.length || 0,
        });
        return NextResponse.json(
          { error: "Unauthorized - invalid webhook secret" },
          { status: 401 }
        );
      }
    }
    
    // Get Convex URL
    const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    // Check if Postmark is configured
    if (!process.env.POSTMARK_SERVER_API_TOKEN) {
      console.error("POSTMARK_SERVER_API_TOKEN not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    // Connect to Convex and check if email was already sent
    const convex = new ConvexHttpClient(convexUrl);
    const post = await convex.query(api.posts.getPostBySlug, { slug });
    
    if (!post) {
      return NextResponse.json(
        { error: `Post with slug "${slug}" not found` },
        { status: 404 }
      );
    }
    
    // Check if email was already sent (idempotency check)
    if (post.emailCampaignSentAt) {
      return NextResponse.json(
        {
          message: "Email campaign already sent for this post",
          slug,
          sentAt: new Date(post.emailCampaignSentAt).toISOString(),
        },
        { status: 200 }
      );
    }
    
    // Get active subscribers count for logging
    const subscribers = await convex.query(api.subscribers.getAllSubscribers, {
      status: "active",
    });
    
    console.log(`📧 Sending email campaign for post "${slug}" to ${subscribers.length} subscribers`);
    
    // Send emails to all subscribers
    const result = await sendBlogPostToSubscribers(slug, convexUrl);
    
    if (!result.success) {
      console.error(`❌ Failed to send emails for post "${slug}"`);
      return NextResponse.json(
        {
          error: "Failed to send emails",
          slug,
          sentCount: result.sentCount,
          errorCount: result.errorCount,
          errors: result.errors,
        },
        { status: 500 }
      );
    }
    
    // Mark email as sent in Convex (idempotency)
    await convex.mutation(api.posts.markEmailCampaignSent, { slug });
    
    console.log(`✅ Successfully sent ${result.sentCount} email(s) for post "${slug}"`);
    
    return NextResponse.json(
      {
        success: true,
        message: "Email campaign sent successfully",
        slug,
        sentCount: result.sentCount,
        errorCount: result.errorCount,
        sentAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/email/new-post:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
