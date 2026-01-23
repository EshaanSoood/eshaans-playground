import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

export const getAllPosts = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_date")
      .order("desc")
      .collect();
    
    return posts;
  },
});

export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx: QueryCtx, args: { slug: string }) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .first();
    
    return post;
  },
});

export const getLatestPosts = query({
  args: { count: v.optional(v.number()) },
  handler: async (ctx: QueryCtx, args: { count?: number }) => {
    const count = args.count ?? 5;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_date")
      .order("desc")
      .take(count);
    
    return posts;
  },
});

export const insertPost = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    summary: v.string(),
    tags: v.array(v.string()),
    projectId: v.string(),
    slug: v.string(),
    content: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      title: string;
      date: string;
      summary: string;
      tags: string[];
      projectId: string;
      slug: string;
      content: string;
    }
  ) => {
    // Check if post with this slug already exists
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      // Update existing post - patch only updates specified fields
      await ctx.db.patch(existing._id, {
        title: args.title,
        date: args.date,
        summary: args.summary,
        tags: args.tags,
        projectId: args.projectId,
        content: args.content,
      });
      return existing._id;
    } else {
      // Insert new post
      return await ctx.db.insert("posts", {
        title: args.title,
        date: args.date,
        summary: args.summary,
        tags: args.tags,
        projectId: args.projectId,
        slug: args.slug,
        content: args.content,
      });
    }
  },
});
