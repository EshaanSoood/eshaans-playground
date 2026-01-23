import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

export interface Post {
  title: string
  date: string
  summary: string
  tags: string[]
  projectId: string
  slug: string
  content: string
}

// Initialize Convex client lazily with fallback
function getConvexClient(): ConvexHttpClient | null {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    // Return null if CONVEX_URL is not set - allows build to succeed
    // Posts will be empty until Convex is configured
    return null;
  }
  return new ConvexHttpClient(convexUrl);
}

export async function getAllPosts(): Promise<Post[]> {
  const convex = getConvexClient();
  if (!convex) {
    // Return empty array if Convex is not configured
    return [];
  }
  try {
    const posts = await convex.query(api.posts.getAllPosts, {});
    // Ensure posts are sorted by date (newest first)
    return (posts as Post[]).sort((a: Post, b: Post) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    // During build, Convex might not be available - return empty array
    // This allows static generation to succeed
    if (process.env.NODE_ENV === 'production' && error instanceof Error && error.message.includes('fetch')) {
      console.warn("Convex not available during build, returning empty posts array");
      return [];
    }
    console.warn("Failed to fetch posts from Convex:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const convex = getConvexClient();
  if (!convex) {
    return null;
  }
  try {
    const post = await convex.query(api.posts.getPostBySlug, { slug });
    return post as Post | null;
  } catch (error) {
    console.warn("Failed to fetch post from Convex:", error);
    return null;
  }
}

export async function getLatestPosts(count: number = 5): Promise<Post[]> {
  const convex = getConvexClient();
  if (!convex) {
    return [];
  }
  try {
    const posts = await convex.query(api.posts.getLatestPosts, { count });
    return posts as Post[];
  } catch (error) {
    console.warn("Failed to fetch latest posts from Convex:", error);
    return [];
  }
}

export function getPostsByProjectId(projectId: string) {
  return []
}

export function groupPostsByProject() {
  return {}
}

