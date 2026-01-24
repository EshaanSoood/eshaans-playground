/**
 * API route for subscribing to the newsletter
 * 
 * POST /api/subscribers/subscribe
 * 
 * Body:
 *   - firstName: string (required)
 *   - lastName: string (required)
 *   - email: string (required)
 *   - honeypot: string (optional) - must be empty for valid submissions
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      honeypot,
    } = body;

    // Honeypot check - if filled, it's spam
    if (honeypot && honeypot.trim() !== '') {
      // Silently reject spam submissions
      return NextResponse.json(
        { success: true, message: "Thank you for subscribing!" },
        { status: 200 }
      );
    }

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email" },
        { status: 400 }
      );
    }

    // Validate field lengths to prevent DoS
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (trimmedFirstName.length > 100 || trimmedLastName.length > 100) {
      return NextResponse.json(
        { error: "Name fields are too long" },
        { status: 400 }
      );
    }

    if (trimmedEmail.length > 254) {
      return NextResponse.json(
        { error: "Email address is too long" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    // Combine firstName and lastName into name field
    const name = `${trimmedFirstName} ${trimmedLastName}`;

    // Add subscriber to Convex
    const subscriberId = await convex.mutation(api.subscribers.addSubscriber, {
      email: trimmedEmail.toLowerCase(),
      name,
      source: "website-modal",
    });

    if (subscriberId === null) {
      // Subscriber already exists and is active
      return NextResponse.json(
        {
          success: true,
          message: "You're already subscribed!",
          alreadySubscribed: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for subscribing!",
        subscriberId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/subscribers/subscribe:", error);

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
