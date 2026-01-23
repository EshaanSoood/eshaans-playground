/**
 * Script to update an existing post in Convex from an MDX file
 * 
 * Usage:
 *   npx tsx scripts/update-post-from-mdx.ts <slug>
 * 
 * Example:
 *   npx tsx scripts/update-post-from-mdx.ts what-is-the-opposite-of-happiness
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });
// Also try to load from Vercel env if available
const vercelEnvPath = resolve(__dirname, '../.env.vercel');
if (fs.existsSync(vercelEnvPath)) {
  dotenv.config({ path: vercelEnvPath });
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: Post slug is required');
    console.error('\nUsage:');
    console.error('  npx tsx scripts/update-post-from-mdx.ts <slug>');
    console.error('\nExample:');
    console.error('  npx tsx scripts/update-post-from-mdx.ts what-is-the-opposite-of-happiness');
    process.exit(1);
  }

  const slug = args[0];
  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    console.error('Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not set.');
    process.exit(1);
  }

  const postsDirectory = path.join(process.cwd(), 'posts');
  const filePath = path.join(postsDirectory, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: Post file not found: ${filePath}`);
    process.exit(1);
  }

  // Read and parse MDX file
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const postData = {
    title: data.title || '',
    date: data.date || new Date().toISOString().split('T')[0],
    summary: data.summary || '',
    tags: data.tags || [],
    projectId: data.projectId || 'playground',
    slug: data.slug || slug,
    content,
  };

  // Validate required fields
  if (!postData.title || !postData.date || !postData.summary) {
    console.error('Error: Post frontmatter missing required fields (title, date, summary)');
    process.exit(1);
  }

  console.log(`📝 Updating post "${postData.title}" in Convex...`);
  console.log(`   Slug: ${postData.slug}\n`);

  try {
    const convex = new ConvexHttpClient(convexUrl);

    // Check if post exists
    const existing = await convex.query(api.posts.getPostBySlug, { slug: postData.slug });
    
    if (!existing) {
      console.error(`❌ Post with slug "${postData.slug}" not found in Convex.`);
      console.error('   Use create-post-from-mdx.ts to create a new post.');
      process.exit(1);
    }

    // Update post in Convex (insertPost mutation handles updates)
    const postId = await convex.mutation(api.posts.insertPost, {
      title: postData.title,
      date: postData.date,
      summary: postData.summary,
      tags: postData.tags,
      projectId: postData.projectId,
      slug: postData.slug,
      content: postData.content,
    });

    console.log('✅ Post updated successfully!');
    console.log(`   Post ID: ${postId}`);
  } catch (error) {
    console.error('❌ Failed to update post:', error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
