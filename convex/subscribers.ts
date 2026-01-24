import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Get all subscribers (filtered by status if provided)
 * This is for internal/admin use only
 */
export const getAllSubscribers = query({
  args: { 
    status: v.optional(v.union(v.literal("active"), v.literal("unsubscribed")))
  },
  handler: async (ctx: QueryCtx, args: { status?: "active" | "unsubscribed" }) => {
    if (args.status) {
      return await ctx.db
        .query("subscribers")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .collect();
    }
    return await ctx.db.query("subscribers").collect();
  },
});

/**
 * Get a subscriber by email
 */
export const getSubscriberByEmail = query({
  args: { email: v.string() },
  handler: async (ctx: QueryCtx, args: { email: string }) => {
    return await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .first();
  },
});

/**
 * Add a new subscriber
 * Returns the subscriber ID if successful, or null if email already exists
 */
export const addSubscriber = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      email: string;
      name?: string;
      source?: string;
    }
  ) => {
    // Check if subscriber with this email already exists
    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .first();
    
    if (existing) {
      // If exists but unsubscribed, reactivate them
      if (existing.status === "unsubscribed") {
        await ctx.db.patch(existing._id, {
          status: "active",
          subscribedAt: Date.now(),
          name: args.name ?? existing.name,
          source: args.source ?? existing.source,
        });
        return existing._id;
      }
      // Already subscribed
      return null;
    }
    
    // Insert new subscriber
    return await ctx.db.insert("subscribers", {
      email: args.email,
      name: args.name,
      subscribedAt: Date.now(),
      status: "active",
      source: args.source,
    });
  },
});

/**
 * Unsubscribe a subscriber by email
 */
export const unsubscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx: MutationCtx, args: { email: string }) => {
    const subscriber = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .first();
    
    if (!subscriber) {
      return null;
    }
    
    await ctx.db.patch(subscriber._id, {
      status: "unsubscribed",
    });
    
    return subscriber._id;
  },
});

/**
 * Delete a subscriber (permanent removal)
 */
export const deleteSubscriber = mutation({
  args: { email: v.string() },
  handler: async (ctx: MutationCtx, args: { email: string }) => {
    const subscriber = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .first();
    
    if (!subscriber) {
      return null;
    }
    
    await ctx.db.delete(subscriber._id);
    return subscriber._id;
  },
});

/**
 * Get subscriber count by status
 */
export const getSubscriberCount = query({
  args: { 
    status: v.optional(v.union(v.literal("active"), v.literal("unsubscribed")))
  },
  handler: async (ctx: QueryCtx, args: { status?: "active" | "unsubscribed" }) => {
    if (args.status) {
      const subscribers = await ctx.db
        .query("subscribers")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .collect();
      return subscribers.length;
    }
    const allSubscribers = await ctx.db.query("subscribers").collect();
    return allSubscribers.length;
  },
});

/**
 * Remove duplicate subscribers, keeping the oldest entry for each email
 */
export const removeDuplicates = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const allSubscribers = await ctx.db.query("subscribers").collect();
    
    // Group by email (case-insensitive)
    const emailMap = new Map<string, typeof allSubscribers>();
    
    for (const subscriber of allSubscribers) {
      const email = subscriber.email.toLowerCase().trim();
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email)!.push(subscriber);
    }
    
    let deleted = 0;
    let kept = 0;
    
    // For each email with duplicates, keep the oldest and delete the rest
    for (const [email, subscribers] of emailMap.entries()) {
      if (subscribers.length > 1) {
        // Sort by creation time (oldest first)
        subscribers.sort((a, b) => a._creationTime - b._creationTime);
        
        // Keep the first (oldest) one
        const toKeep = subscribers[0];
        kept++;
        
        // Delete the rest
        for (let i = 1; i < subscribers.length; i++) {
          await ctx.db.delete(subscribers[i]._id);
          deleted++;
        }
      } else {
        kept++;
      }
    }
    
    return { deleted, kept, totalUnique: emailMap.size };
  },
});
