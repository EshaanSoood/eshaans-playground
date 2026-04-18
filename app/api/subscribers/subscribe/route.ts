/**
 * API route for subscribing to the newsletter
 *
 * Legacy compatibility wrapper.
 * New UI should call Listmonk directly from the browser.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  LISTMONK_PUBLIC_SUBSCRIPTION_URL,
  buildPublicSubscriptionPayload,
} from "@/lib/listmonk-public";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, honeypot } = body;

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

    const listmonkResponse = await fetch(LISTMONK_PUBLIC_SUBSCRIPTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        buildPublicSubscriptionPayload({
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          email: trimmedEmail.toLowerCase(),
        })
      ),
    });

    const listmonkText = await listmonkResponse.text();
    const listmonkData = listmonkText ? JSON.parse(listmonkText) : null;

    if (!listmonkResponse.ok) {
      return NextResponse.json(
        {
          error: listmonkData?.message || "Failed to subscribe",
        },
        { status: listmonkResponse.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Success. Check your email to confirm your subscription.",
        provider: "listmonk",
      },
      { status: 200 }
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
    {
      error:
        "Method not allowed. Use POST to subscribe, or call Listmonk directly from the browser.",
    },
    { status: 405 }
  );
}
