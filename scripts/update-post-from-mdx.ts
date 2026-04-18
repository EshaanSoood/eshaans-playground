/**
 * Script to update an existing post in the external Payload CMS from an MDX file.
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
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

try {
  dotenv.config({ path: resolve(__dirname, '../.env.vercel') });
} catch {
  // Ignore if .env.vercel doesn't exist
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Error: Post slug is required');
    console.error('\nUsage:');
    console.error('  npx tsx scripts/update-post-from-mdx.ts <slug>');
    process.exit(1);
  }

  const slug = args[0];
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filePath = path.join(postsDirectory, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: Post file not found: ${filePath}`);
    process.exit(1);
  }

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
    sendEmail: false,
  };

  if (!postData.title || !postData.date || !postData.summary) {
    console.error('Error: Post frontmatter missing required fields (title, date, summary)');
    process.exit(1);
  }

  const blogUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_BLOG_URL || 'https://blog.eshaansood.in');
  const createPostUrl = `${blogUrl}/api/posts/create`;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  console.log(`📝 Updating post "${postData.title}" in Payload CMS...`);
  console.log(`   Slug: ${postData.slug}\n`);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (webhookSecret) {
      headers['Authorization'] = `Bearer ${webhookSecret}`;
    }

    const response = await fetch(createPostUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...postData,
        webhookSecret,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to update post:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${result.error || result.message || 'Unknown error'}`);
      process.exit(1);
    }

    console.log('✅ Post updated successfully!');
    console.log(`   Post ID: ${result.postId}`);
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
