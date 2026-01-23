/**
 * Migration script to import existing MDX posts into Convex
 * 
 * Usage:
 * 1. Make sure CONVEX_URL is set in your environment
 * 2. Run: npx tsx scripts/migrate-posts.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ConvexHttpClient } from 'convex/browser';
import type { api } from '../convex/_generated/api';

const postsDirectory = path.join(process.cwd(), 'posts');

interface PostData {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  projectId: string;
  slug: string;
  content: string;
}

function getAllPostFiles(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    console.log('No posts directory found. Skipping migration.');
    return [];
  }
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.mdx'));
}

function getPostData(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    title: data.title || '',
    date: data.date || '',
    summary: data.summary || '',
    tags: data.tags || [],
    projectId: data.projectId || '',
    slug: data.slug || slug,
    content,
  };
}

async function migratePosts() {
  const convexUrl = process.env.CONVEX_URL;
  if (!convexUrl) {
    console.error('Error: CONVEX_URL environment variable is not set.');
    console.error('Please set it in your .env file or run: export CONVEX_URL=your_convex_url');
    process.exit(1);
  }

  const convex = new ConvexHttpClient(convexUrl);
  const postFiles = getAllPostFiles();

  if (postFiles.length === 0) {
    console.log('No posts found to migrate.');
    return;
  }

  console.log(`Found ${postFiles.length} posts to migrate...`);

  // Note: You'll need to create a mutation in convex/posts.ts to insert posts
  // For now, this script shows the structure - you'll need to add:
  // export const insertPost = mutation({...}) in convex/posts.ts
  console.log('Note: You need to create an insertPost mutation in convex/posts.ts first.');
  console.log('Posts to migrate:');
  
  for (const file of postFiles) {
    const slug = file.replace(/\.mdx$/, '');
    const post = getPostData(slug);
    if (post) {
      console.log(`- ${post.title} (${post.slug})`);
    }
  }
}

migratePosts().catch(console.error);
