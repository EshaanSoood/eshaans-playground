/**
 * API route for unsubscribing from the newsletter
 * 
 * POST /api/subscribers/unsubscribe
 * 
 * Body:
 *   - email: string (required)
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
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

    // Unsubscribe the user
    const subscriberId = await convex.mutation(api.subscribers.unsubscribe, {
      email: trimmedEmail,
    });

    if (subscriberId === null) {
      // Subscriber not found - but we'll still return success to prevent email enumeration
      return NextResponse.json(
        {
          success: true,
          message: "You've been unsubscribed successfully.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "You've been unsubscribed successfully.",
        subscriberId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/subscribers/unsubscribe:", error);

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
