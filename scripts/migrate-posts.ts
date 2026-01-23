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
import * as dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

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
  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error('Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not set.');
    console.error('Please set it in your .env file or run: export CONVEX_URL=your_convex_url');
    process.exit(1);
  }

  const convex = new ConvexHttpClient(convexUrl);
  const postFiles = getAllPostFiles();

  if (postFiles.length === 0) {
    console.log('No posts found to migrate.');
    return;
  }

  console.log(`Found ${postFiles.length} posts to migrate...\n`);

  for (const file of postFiles) {
    const slug = file.replace(/\.mdx$/, '');
    const post = getPostData(slug);
    
    if (!post) {
      console.log(`⚠️  Skipping ${slug} - could not read post data`);
      continue;
    }

    try {
      // Check if post already exists
      const existing = await convex.query(api.posts.getPostBySlug, { slug: post.slug });
      
      if (existing) {
        console.log(`ℹ️  Post "${post.title}" already exists in Convex, skipping...`);
        continue;
      }

      // Insert post into Convex
      const postId = await convex.mutation(api.posts.insertPost, {
        title: post.title,
        date: post.date,
        summary: post.summary,
        tags: post.tags,
        projectId: post.projectId,
        slug: post.slug,
        content: post.content,
      });

      console.log(`✅ Migrated "${post.title}" (${post.slug})`);

      // Automatically trigger email webhook
      const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL || 'https://blog.eshaansood.in';
      const emailWebhookUrl = `${blogUrl}/api/email/new-post`;
      const webhookSecret = process.env.WEBHOOK_SECRET;

      console.log(`📧 Triggering email webhook...`);
      
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (webhookSecret) {
          headers['Authorization'] = `Bearer ${webhookSecret}`;
        }

        const emailResponse = await fetch(emailWebhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            slug: post.slug,
            webhookSecret,
          }),
        });

        const emailResult = await emailResponse.json();

        if (emailResponse.ok) {
          console.log(`   ✅ Email sent to ${emailResult.sentCount || 0} subscribers`);
        } else {
          console.warn(`   ⚠️  Email failed: ${emailResult.error || emailResult.message}`);
        }
      } catch (emailError) {
        console.warn(`   ⚠️  Email webhook error:`, emailError instanceof Error ? emailError.message : String(emailError));
      }
    } catch (error) {
      console.error(`❌ Failed to migrate "${post.title}":`, error);
    }
  }

  console.log('\n✨ Migration complete!');
}

migratePosts().catch(console.error);
