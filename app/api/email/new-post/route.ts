/**
 * API route for sending email notifications when a new post is published.
 *
 * This endpoint is called via webhook after a post has been synced to Payload.
 *
 * POST /api/email/new-post
 *
 * Body:
 *   - slug: string (required) - The slug of the post to send emails for
 *   - webhookSecret: string (optional) - Secret key for webhook authentication
 *
 * Environment variables:
 *   - WEBHOOK_SECRET - Secret key for webhook authentication (optional but recommended)
 *   - PAYLOAD_CMS_URL - Base URL for the external Payload CMS
 *   - CMS_WEBHOOK_SECRET - Shared secret used to read and update posts in the CMS
 *   - LISTMONK_API_CREDENTIALS or LISTMONK_API_USER + LISTMONK_API_TOKEN
 *   - LISTMONK_BLOG_LIST_ID - Numeric Listmonk list ID (defaults to 3)
 *   - LISTMONK_FROM_EMAIL - From email address
 */

import { NextRequest, NextResponse } from "next/server";

import { generatePlainTextFromHtml } from "@/lib/email-templates";
import { createAndStartCampaign, getListmonkFromEmail } from "@/lib/listmonk-server";
import { mdxToEmailHtml } from "@/lib/mdx-to-email";
import { getManagedPostBySlug, markManagedPostEmailSent } from "@/lib/payload-cms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, webhookSecret: bodySecret } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'slug' parameter" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const webhookSecret = process.env.WEBHOOK_SECRET?.trim();

    if (webhookSecret) {
      const providedSecret = authHeader?.replace(/^Bearer\s+/i, '').trim();
      const isValidAuth = providedSecret === webhookSecret;
      const isValidBody = bodySecret?.trim() === webhookSecret;

      if (!isValidAuth && !isValidBody) {
        console.error("Webhook authentication failed - invalid secret provided");
        return NextResponse.json(
          { error: "Unauthorized - invalid webhook secret" },
          { status: 401 }
        );
      }
    }

    const post = await getManagedPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: `Post with slug "${slug}" not found` },
        { status: 404 }
      );
    }

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

    const contentHtml = await mdxToEmailHtml(post.content);
    const postUrlBase =
      process.env.NEXT_PUBLIC_BLOG_URL?.trim() ||
      `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`;
    const postUrl = `${postUrlBase.replace(/\/$/, "")}/posts/${slug}`;
    const campaignBody = `
      <h1>${post.title}</h1>
      <p><strong>${new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</strong></p>
      ${contentHtml}
      <p><a href="${postUrl}">Read this post on the website</a></p>
    `.trim();
    const altBody = generatePlainTextFromHtml(campaignBody);

    console.log(`📧 Creating Listmonk campaign for post "${slug}"...`);

    try {
      const campaignId = await createAndStartCampaign({
        name: `New post: ${post.title}`,
        subject: post.title,
        body: campaignBody,
        altbody: altBody,
        tags: ["blog", "auto-send", slug],
      });

      const sentAt = new Date().toISOString();
      await markManagedPostEmailSent(post.id, sentAt);

      console.log(`✅ Successfully started Listmonk campaign ${campaignId} for "${slug}"`);

      return NextResponse.json(
        {
          success: true,
          message: "Email campaign sent successfully",
          slug,
          provider: "listmonk",
          campaignId,
          fromEmail: getListmonkFromEmail(),
          sentAt,
        },
        { status: 200 }
      );
    } catch (campaignError) {
      console.error(`❌ Error creating Listmonk campaign:`, campaignError);
      return NextResponse.json(
        {
          error: "Failed to create Listmonk campaign",
          message: campaignError instanceof Error ? campaignError.message : String(campaignError),
          slug,
        },
        { status: 500 }
      );
    }
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

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
