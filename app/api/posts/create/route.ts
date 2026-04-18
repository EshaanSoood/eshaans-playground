/**
 * API route for creating or updating a blog post in the external Payload CMS.
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
 *   - published: boolean (optional) - Whether the post should be public (default: true)
 *   - sendEmail: boolean (optional) - Whether to send email immediately (default: true)
 *   - webhookSecret: string (optional) - For authentication
 */

import { NextRequest, NextResponse } from "next/server";

import { upsertManagedPost } from "@/lib/payload-cms";

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
      published = true,
      sendEmail = true,
      webhookSecret: bodySecret,
    } = body;

    if (!title || !date || !summary || !tags || !projectId || !slug || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, date, summary, tags, projectId, slug, content" },
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
        return NextResponse.json(
          { error: "Unauthorized - invalid webhook secret" },
          { status: 401 }
        );
      }
    }

    console.log(`📝 Syncing post "${title}" (${slug}) to Payload CMS...`);
    const result = await upsertManagedPost({
      title,
      date,
      summary,
      tags,
      projectId,
      slug,
      content,
      published,
    });

    const isUpdate = !result.created;
    const postId = result.post.id;

    console.log(`✅ Post ${isUpdate ? 'updated' : 'created'} successfully in Payload CMS with ID: ${postId}`);

    if (sendEmail) {
      let blogUrl = process.env.NEXT_PUBLIC_BLOG_URL;

      if (!blogUrl) {
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        blogUrl = `${protocol}://${host}`;
      }

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
