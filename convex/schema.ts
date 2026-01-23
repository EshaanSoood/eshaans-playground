import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    date: v.string(),
    summary: v.string(),
    tags: v.array(v.string()),
    projectId: v.string(),
    slug: v.string(),
    content: v.string(),
    emailCampaignSentAt: v.optional(v.number()),
  }).index("by_slug", ["slug"]).index("by_date", ["date"]),
  subscribers: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    subscribedAt: v.number(),
    status: v.union(v.literal("active"), v.literal("unsubscribed")),
    source: v.optional(v.string()),
  }).index("by_email", ["email"]).index("by_status", ["status"]),
});
