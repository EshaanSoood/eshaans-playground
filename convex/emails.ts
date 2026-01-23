/**
 * Convex functions for email-related operations
 * Note: Actual email sending happens in scripts/API routes due to file system and env var requirements
 */

import { query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";

/**
 * Get all active subscribers for email sending
 * This can be called from scripts or API routes
 */
export const getActiveSubscribersForEmail = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const subscribers = await ctx.db
      .query("subscribers")
      .withIndex("by_status", (q: any) => q.eq("status", "active"))
      .collect();
    
    return subscribers.map((sub) => ({
      email: sub.email,
      name: sub.name,
      _id: sub._id,
    }));
  },
});

/**
 * Get subscriber count for email sending
 */
export const getActiveSubscriberCount = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const subscribers = await ctx.db
      .query("subscribers")
      .withIndex("by_status", (q: any) => q.eq("status", "active"))
      .collect();
    
    return subscribers.length;
  },
});

/**
 * Get a blog post by slug for email sending
 * This can be called from scripts to get post data before sending emails
 */
export const getPostForEmail = query({
  args: { slug: v.string() },
  handler: async (ctx: QueryCtx, args: { slug: string }) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .first();
    
    if (!post) {
      return null;
    }
    
    return {
      title: post.title,
      date: post.date,
      summary: post.summary,
      slug: post.slug,
      content: post.content,
    };
  },
});
