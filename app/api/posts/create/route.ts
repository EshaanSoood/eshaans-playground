/**
 * API route for creating a new blog post and automatically sending emails
 * 
 * POST /api/posts/create
 * 
 * Body:
 *   - title: string (required)
 *   - date: string (required) - ISO date string
 *   - summary: string (required)
 *   - tags: string[] (required)
 *   - projectId: string (required)
 *   - slug: string (required)
 *   - content: string (required) - MDX content
 *   - sendEmail: boolean (optional) - Whether to send email immediately (default: true)
 *   - webhookSecret: string (optional) - For authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      date,
      summary,
      tags,
      projectId,
      slug,
      content,
      sendEmail = true,
      webhookSecret: bodySecret,
    } = body;

    // Validate required fields
    if (!title || !date || !summary || !tags || !projectId || !slug || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, date, summary, tags, projectId, slug, content" },
        { status: 400 }
      );
    }

    // Verify webhook secret
    const authHeader = request.headers.get("authorization");
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (webhookSecret) {
      const isValidAuth = authHeader === `Bearer ${webhookSecret}`;
      const isValidBody = bodySecret === webhookSecret;

      if (!isValidAuth && !isValidBody) {
        return NextResponse.json(
          { error: "Unauthorized - invalid webhook secret" },
          { status: 401 }
        );
      }
    }

    // Get Convex URL
    const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json(
        { error: "Server configuration error: CONVEX_URL not set" },
        { status: 500 }
      );
    }

    const convex = new ConvexHttpClient(convexUrl);

    // Check if post already exists - if it does, we'll update it
    const existing = await convex.query(api.posts.getPostBySlug, { slug });
    const isUpdate = !!existing;

    // Create or update post in Convex (insertPost handles both)
    console.log(`📝 ${isUpdate ? 'Updating' : 'Creating'} post "${title}" (${slug}) in Convex...`);
    const postId = await convex.mutation(api.posts.insertPost, {
      title,
      date,
      summary,
      tags,
      projectId,
      slug,
      content,
    });

    console.log(`✅ Post ${isUpdate ? 'updated' : 'created'} successfully with ID: ${postId}`);

    // Automatically send email if requested
    if (sendEmail) {
      // Determine the correct base URL
      let blogUrl = process.env.NEXT_PUBLIC_BLOG_URL;
      
      // If not set, try to construct from request
      if (!blogUrl) {
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        blogUrl = `${protocol}://${host}`;
      }
      
      // Fallback to production URL
      if (!blogUrl) {
        blogUrl = 'https://blog.eshaansood.in';
      }
      
      const emailWebhookUrl = `${blogUrl}/api/email/new-post`;
      
      console.log(`📧 Triggering email webhook for post "${slug}"...`);
      
      try {
        const emailHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (webhookSecret) {
          emailHeaders['Authorization'] = `Bearer ${webhookSecret}`;
        }

        const emailResponse = await fetch(emailWebhookUrl, {
          method: 'POST',
          headers: emailHeaders,
          body: JSON.stringify({
            slug,
            webhookSecret: webhookSecret || bodySecret,
          }),
        });

        const emailResult = await emailResponse.json();

        if (emailResponse.ok) {
          console.log(`✅ Email campaign sent successfully to ${emailResult.sentCount || 0} subscribers`);
          return NextResponse.json(
            {
              success: true,
              message: `Post ${isUpdate ? 'updated' : 'created'} and email sent successfully`,
              postId,
              slug,
              emailSent: true,
              emailResult,
              updated: isUpdate,
            },
            { status: isUpdate ? 200 : 201 }
          );
        } else {
          console.error(`⚠️  Post ${isUpdate ? 'updated' : 'created'} but email failed:`, emailResult);
          return NextResponse.json(
            {
              success: true,
              message: `Post ${isUpdate ? 'updated' : 'created'} but email sending failed`,
              postId,
              slug,
              emailSent: false,
              emailError: emailResult,
              updated: isUpdate,
            },
            { status: isUpdate ? 200 : 201 }
          );
        }
      } catch (emailError) {
        console.error(`⚠️  Post ${isUpdate ? 'updated' : 'created'} but email webhook failed:`, emailError);
        return NextResponse.json(
          {
            success: true,
            message: `Post ${isUpdate ? 'updated' : 'created'} but email webhook failed`,
            postId,
            slug,
            emailSent: false,
            emailError: emailError instanceof Error ? emailError.message : String(emailError),
            updated: isUpdate,
          },
          { status: isUpdate ? 200 : 201 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Post ${isUpdate ? 'updated' : 'created'} successfully`,
        postId,
        slug,
        emailSent: false,
        updated: isUpdate,
      },
      { status: isUpdate ? 200 : 201 }
    );
  } catch (error) {
    console.error("Error in /api/posts/create:", error);

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
