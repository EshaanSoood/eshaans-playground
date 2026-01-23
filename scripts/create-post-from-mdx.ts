/**
 * Script to create a post in Convex from an MDX file and automatically send emails
 * 
 * Usage:
 *   npx tsx scripts/create-post-from-mdx.ts <slug> [--no-email]
 * 
 * Examples:
 *   npx tsx scripts/create-post-from-mdx.ts what-is-the-opposite-of-happiness
 *   npx tsx scripts/create-post-from-mdx.ts my-new-post --no-email
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });
// Also try to load from Vercel env if available
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
    console.error('  npx tsx scripts/create-post-from-mdx.ts <slug> [--no-email]');
    console.error('\nExamples:');
    console.error('  npx tsx scripts/create-post-from-mdx.ts what-is-the-opposite-of-happiness');
    console.error('  npx tsx scripts/create-post-from-mdx.ts my-new-post --no-email');
    process.exit(1);
  }

  const slug = args[0];
  const sendEmail = !args.includes('--no-email');

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
    sendEmail,
  };

  // Validate required fields
  if (!postData.title || !postData.date || !postData.summary) {
    console.error('Error: Post frontmatter missing required fields (title, date, summary)');
    process.exit(1);
  }

  // Use localhost for development, production URL otherwise
  const blogUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_BLOG_URL || 'https://blog.eshaansood.in');
  const createPostUrl = `${blogUrl}/api/posts/create`;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  console.log(`📝 Creating post "${postData.title}" from MDX file...`);
  console.log(`   Slug: ${postData.slug}`);
  console.log(`   Send email: ${sendEmail ? 'Yes' : 'No'}\n`);

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

    if (response.ok) {
      console.log('✅ Post created successfully!');
      console.log(`   Post ID: ${result.postId}`);
      
      if (result.emailSent) {
        console.log(`   ✅ Email sent to ${result.emailResult?.sentCount || 0} subscribers`);
      } else if (sendEmail) {
        console.warn(`   ⚠️  Email was not sent: ${result.emailError || 'Unknown error'}`);
      }
    } else {
      console.error('❌ Failed to create post:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${result.error || result.message || 'Unknown error'}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to create post:', error);
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
