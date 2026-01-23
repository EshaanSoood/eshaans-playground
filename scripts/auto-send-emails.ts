/**
 * Script to automatically detect and send emails for new blog posts and newsletters
 * Used by GitHub Actions workflow
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import fs from "fs";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { sendBlogPostToSubscribers } from "../lib/email-blog";
import { sendNewsletterToSubscribers, getNewsletterData } from "../lib/email-newsletter";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

interface ChangedFile {
  path: string;
  status: "added" | "modified" | "deleted";
}

/**
 * Parse changed files from GitHub Actions or git diff
 */
function getChangedFiles(): ChangedFile[] {
  const changedFiles: ChangedFile[] = [];
  
  // Check if running in GitHub Actions
  const githubEventPath = process.env.GITHUB_EVENT_PATH;
  const githubSha = process.env.GITHUB_SHA;
  const githubBaseRef = process.env.GITHUB_BASE_REF || "HEAD~1";
  
  if (githubEventPath && fs.existsSync(githubEventPath)) {
    // GitHub Actions: use push event data
    try {
      const event = JSON.parse(fs.readFileSync(githubEventPath, "utf8"));
      
      // Check push event commits
      if (event.commits && Array.isArray(event.commits)) {
        event.commits.forEach((commit: any) => {
          if (commit.added && Array.isArray(commit.added)) {
            commit.added.forEach((file: string) => {
              changedFiles.push({ path: file, status: "added" });
            });
          }
          if (commit.modified && Array.isArray(commit.modified)) {
            commit.modified.forEach((file: string) => {
              changedFiles.push({ path: file, status: "modified" });
            });
          }
        });
      }
      
      // Also check the head_commit
      if (event.head_commit) {
        if (event.head_commit.added && Array.isArray(event.head_commit.added)) {
          event.head_commit.added.forEach((file: string) => {
            if (!changedFiles.some((f) => f.path === file)) {
              changedFiles.push({ path: file, status: "added" });
            }
          });
        }
        if (event.head_commit.modified && Array.isArray(event.head_commit.modified)) {
          event.head_commit.modified.forEach((file: string) => {
            if (!changedFiles.some((f) => f.path === file)) {
              changedFiles.push({ path: file, status: "modified" });
            }
          });
        }
      }
    } catch (error) {
      console.warn("Could not parse GitHub event, trying git diff...");
    }
  }
  
  // Fallback: use git diff (works in GitHub Actions and locally)
  if (changedFiles.length === 0) {
    const { execSync } = require("child_process");
    try {
      // Try to get diff between commits
      let diffCommand = `git diff --name-status ${githubBaseRef} ${githubSha || "HEAD"}`;
      if (!githubSha) {
        // Local: compare with previous commit
        diffCommand = "git diff --name-status HEAD~1 HEAD";
      }
      
      const diff = execSync(diffCommand, { encoding: "utf8", stdio: "pipe" });
      diff.split("\n").forEach((line: string) => {
        if (line.trim()) {
          const parts = line.split("\t");
          if (parts.length >= 2) {
            const status = parts[0];
            const path = parts.slice(1).join("\t");
            
            if (status.startsWith("A") || status.startsWith("??")) {
              changedFiles.push({ path, status: "added" });
            } else if (status.startsWith("M")) {
              changedFiles.push({ path, status: "modified" });
            }
          }
        }
      });
    } catch (error) {
      console.warn("Could not get git diff:", error instanceof Error ? error.message : String(error));
    }
  }
  
  return changedFiles;
}

/**
 * Migrate a blog post to Convex
 */
async function migratePostToConvex(slug: string, convexUrl: string): Promise<void> {
  const postsDirectory = resolve(process.cwd(), "posts");
  const filePath = resolve(postsDirectory, `${slug}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Post file not found: ${filePath}`);
  }
  
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  
  const convex = new ConvexHttpClient(convexUrl);
  
  await convex.mutation(api.posts.insertPost, {
    title: data.title || "",
    date: data.date || new Date().toISOString().split("T")[0],
    summary: data.summary || "",
    tags: data.tags || [],
    projectId: data.projectId || "playground",
    slug: data.slug || slug,
    content,
  });
  
  console.log(`✅ Migrated post "${data.title}" to Convex`);
}

/**
 * Main function to detect and send emails
 */
async function main() {
  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    throw new Error("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }
  
  let changedFiles = getChangedFiles();
  
  if (changedFiles.length === 0) {
    console.log("No changed files detected. Checking all files in posts/ and newsletters/...");
    // Fallback: check all files (useful for manual runs)
    const postsDir = resolve(process.cwd(), "posts");
    const newslettersDir = resolve(process.cwd(), "newsletters");
    
    changedFiles = [];
    
    if (fs.existsSync(postsDir)) {
      const postFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));
      postFiles.forEach((file) => {
        changedFiles.push({ path: `posts/${file}`, status: "added" });
      });
    }
    
    if (fs.existsSync(newslettersDir)) {
      const newsletterFiles = fs.readdirSync(newslettersDir).filter((f) => f.endsWith(".mdx"));
      newsletterFiles.forEach((file) => {
        changedFiles.push({ path: `newsletters/${file}`, status: "added" });
      });
    }
  }
  
  const newBlogPosts: string[] = [];
  const newNewsletters: string[] = [];
  
  // Categorize changed files
  changedFiles.forEach((file) => {
    if (file.status === "added" || file.status === "modified") {
      if (file.path.startsWith("posts/") && file.path.endsWith(".mdx")) {
        const slug = file.path.replace("posts/", "").replace(".mdx", "");
        newBlogPosts.push(slug);
      } else if (file.path.startsWith("newsletters/") && file.path.endsWith(".mdx")) {
        const filename = file.path.replace("newsletters/", "").replace(".mdx", "");
        newNewsletters.push(filename);
      }
    }
  });
  
  console.log(`Found ${newBlogPosts.length} new/modified blog post(s)`);
  console.log(`Found ${newNewsletters.length} new/modified newsletter(s)`);
  
  // Process blog posts
  for (const slug of newBlogPosts) {
    try {
      console.log(`\n📝 Processing blog post: ${slug}`);
      
      // First, migrate to Convex if it's a new file
      const postsDirectory = resolve(process.cwd(), "posts");
      const filePath = resolve(postsDirectory, `${slug}.mdx`);
      
      if (fs.existsSync(filePath)) {
        // Check if post already exists in Convex
        const convex = new ConvexHttpClient(convexUrl);
        const existingPost = await convex.query(api.posts.getPostBySlug, { slug });
        
        if (!existingPost) {
          console.log(`📦 Migrating new post "${slug}" to Convex...`);
          await migratePostToConvex(slug, convexUrl);
          
          // Wait a bit for Convex to sync
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          console.log(`ℹ️  Post "${slug}" already exists in Convex, skipping migration`);
        }
      }
      
      // Send email
      console.log(`📧 Sending blog post "${slug}" to subscribers...`);
      const result = await sendBlogPostToSubscribers(slug, convexUrl);
      
      if (result.success) {
        console.log(`✅ Successfully sent ${result.sentCount} email(s) for "${slug}"`);
        if (result.errorCount > 0) {
          console.warn(`⚠️  ${result.errorCount} email(s) failed`);
        }
      } else {
        console.error(`❌ Failed to send emails for "${slug}"`);
        if (result.errors) {
          result.errors.forEach((err) => {
            console.error(`  - ${err.email}: ${err.error}`);
          });
        }
      }
    } catch (error) {
      console.error(`❌ Error processing blog post "${slug}":`, error);
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }
  
  // Process newsletters
  for (const filename of newNewsletters) {
    try {
      console.log(`\n📬 Processing newsletter: ${filename}`);
      
      // Verify newsletter exists
      const newsletter = getNewsletterData(filename);
      if (!newsletter) {
        console.error(`❌ Newsletter "${filename}" not found`);
        continue;
      }
      
      // Send email
      console.log(`📧 Sending newsletter "${filename}" to subscribers...`);
      const result = await sendNewsletterToSubscribers(filename, convexUrl);
      
      if (result.success) {
        console.log(`✅ Successfully sent ${result.sentCount} email(s) for "${filename}"`);
        if (result.errorCount > 0) {
          console.warn(`⚠️  ${result.errorCount} email(s) failed`);
        }
      } else {
        console.error(`❌ Failed to send emails for "${filename}"`);
        if (result.errors) {
          result.errors.forEach((err) => {
            console.error(`  - ${err.email}: ${err.error}`);
          });
        }
      }
    } catch (error) {
      console.error(`❌ Error processing newsletter "${filename}":`, error);
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }
  
  if (newBlogPosts.length === 0 && newNewsletters.length === 0) {
    console.log("No new blog posts or newsletters to send.");
  } else {
    console.log("\n✨ Email sending complete!");
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
