# Email System Documentation

This document explains how the email system works for sending blog posts and newsletters to subscribers via Postmark.

## Overview

The email system consists of two main types of emails:

1. **Blog Post Emails** - Automatically convert blog posts (stored in Convex) to HTML emails and send to subscribers
2. **Newsletter Emails** - Send custom newsletters (stored as MDX files) to subscribers

Both types use the same email-safe CSS template and are sent through Postmark's API.

## Architecture

### File Structure

```
lib/
  email.ts              # Postmark client and core email functions
  email-templates.ts    # HTML email templates with inline CSS
  mdx-to-email.ts       # MDX/Markdown to HTML converter
  email-blog.ts         # Blog post email sending functions
  email-newsletter.ts   # Newsletter email sending functions

convex/
  emails.ts             # Convex queries for email-related data
  posts.ts              # Blog post queries
  subscribers.ts        # Subscriber management

newsletters/            # Newsletter MDX files (archival)
  example-newsletter.mdx

scripts/
  send-blog-post.ts     # CLI script to send blog post emails
  send-newsletter.ts    # CLI script to send newsletter emails
  auto-send-emails.ts   # Legacy script (deprecated - use webhook instead)

app/api/email/
  new-post/route.ts     # Webhook endpoint for sending emails on post publish
```

### Email Flow

1. **Content Source**: Blog posts come from Convex database, newsletters come from MDX files
2. **Conversion**: MDX content is converted to email-safe HTML with inline styles
3. **Template**: HTML is wrapped in email template with header, footer, and unsubscribe link
4. **Sending**: Emails are sent via Postmark batch API to all active subscribers

## Blog Posts

### How Blog Posts Work

Blog posts are stored in the Convex database and can be sent as emails to subscribers. When a blog post is sent:

1. The post is fetched from Convex by slug
2. MDX content is converted to email-safe HTML
3. Email is generated with title, date, and content
4. Includes "View online" link to the blog post page
5. Sent to all active subscribers via Postmark

### Blog Post Structure

Blog posts in Convex have the following structure:

```typescript
{
  title: string;        // Post title
  date: string;         // ISO date string (e.g., "2025-01-23")
  summary: string;      // Short description/summary
  tags: string[];       // Array of tags
  projectId: string;    // Associated project ID
  slug: string;         // URL-friendly identifier
  content: string;      // MDX content (markdown with optional JSX)
}
```

### Creating Blog Posts

Blog posts are created in two ways:

#### Method 1: MDX Files (Recommended)

1. Create an MDX file in the `posts/` directory:
   ```mdx
   ---
   title: "Your Blog Post Title"
   date: "2025-01-23"
   summary: "A brief summary of your post"
   tags: ["tag1", "tag2"]
   projectId: "playground"
   slug: "your-post-slug"
   ---

   # Your Blog Post Title

   Your content here in markdown format...

   ## Section Heading

   More content...
   ```

2. Migrate to Convex using the migration script:
   ```bash
   npx tsx scripts/migrate-posts.ts
   ```

#### Method 2: Direct Convex Insert

Use the Convex mutation `api.posts.insertPost` to add posts directly to the database.

### Sending Blog Post Emails

### Automatic Sending (Recommended)

**Blog posts are automatically sent via webhook when published!**

When a post is published (status changes to "published"), call the webhook endpoint:
1. Your CMS/admin UI calls `POST /api/email/new-post` with the post slug
2. The endpoint checks if email was already sent (idempotent)
3. Fetches subscribers from Convex
4. Sends emails via Postmark
5. Marks the post as sent in Convex

**Setup**: Configure your CMS/admin UI to call the webhook when publishing a post.

### Manual Sending

**Send to all subscribers:**
```bash
npx tsx scripts/send-blog-post.ts <slug>
```

**Example:**
```bash
npx tsx scripts/send-blog-post.ts nextjs-deep-dive
```

**Test with a single email:**
```bash
npx tsx scripts/send-blog-post.ts <slug> --test user@example.com
```

**Example:**
```bash
npx tsx scripts/send-blog-post.ts nextjs-deep-dive --test test@example.com
```

## Newsletters

### How Newsletters Work

Newsletters are stored as MDX files in the `newsletters/` directory. They are **not** publicly visible on the website - they exist only for archival purposes and email sending. When a newsletter is sent:

1. Newsletter MDX file is read from the `newsletters/` directory
2. Frontmatter is parsed (title, date, subject)
3. MDX content is converted to email-safe HTML
4. Email is generated with title, date, and content
5. Sent to all active subscribers via Postmark

### Newsletter Structure

Newsletters use MDX format with frontmatter:

```mdx
---
title: "Newsletter Title"
date: "2025-01-23"
subject: "Email Subject Line"
---

# Newsletter Content

Your newsletter content in markdown format...
```

**Frontmatter Fields:**
- `title` (required) - Newsletter title displayed in email
- `date` (required) - Publication date (ISO format: "YYYY-MM-DD")
- `subject` (required) - Email subject line (can differ from title)

### Creating Newsletters

1. Create a new MDX file in the `newsletters/` directory:
   ```bash
   touch newsletters/my-newsletter.mdx
   ```

2. Add frontmatter and content:
   ```mdx
   ---
   title: "Monthly Update - January 2025"
   date: "2025-01-23"
   subject: "January Newsletter: What's New"
   ---

   # Monthly Update - January 2025

   Welcome to our January newsletter!

   ## What's New

   - New blog posts published
   - Project updates
   - Community highlights

   ## Featured Content

   Check out our latest blog post on [Next.js Deep Dive](/posts/nextjs-deep-dive).

   ---

   *Thanks for reading!*
   ```

3. **Important**: Newsletter files are stored in the repo for archival but are NOT publicly accessible on the website.

### Sending Newsletter Emails

### Automatic Sending (Recommended)

**Newsletters are automatically sent when pushed to the repository!**

When you push a new newsletter (`.mdx` file in `newsletters/`) to the `main` or `master` branch, GitHub Actions will:
1. Detect the new/modified newsletter
2. Automatically send it to all active subscribers

**No manual action required** - just push your newsletter and emails will be sent automatically.

### Manual Sending

**Send to all subscribers:**
```bash
npx tsx scripts/send-newsletter.ts <filename>
```

**Note**: Use the filename WITHOUT the `.mdx` extension.

**Example:**
```bash
npx tsx scripts/send-newsletter.ts example-newsletter
```

**Test with a single email:**
```bash
npx tsx scripts/send-newsletter.ts <filename> --test user@example.com
```

**Example:**
```bash
npx tsx scripts/send-newsletter.ts example-newsletter --test test@example.com
```

**List available newsletters:**
```bash
npx tsx scripts/send-newsletter.ts
# (without arguments, shows usage and available newsletters)
```

## Content Formatting

### Supported Markdown Features

Both blog posts and newsletters support standard markdown:

- **Headings**: `# H1`, `## H2`, `### H3`, etc.
- **Paragraphs**: Regular text separated by blank lines
- **Lists**: Ordered (`1.`) and unordered (`-`)
- **Links**: `[text](url)`
- **Bold**: `**bold text**`
- **Italic**: `*italic text*`
- **Code blocks**: Triple backticks with language
- **Inline code**: Single backticks
- **Blockquotes**: `> quote text`
- **Horizontal rules**: `---`

### Email-Safe Formatting

The email converter automatically:
- Adds inline styles for email client compatibility
- Converts code blocks to email-safe format
- Handles images (make sure image URLs are absolute and publicly accessible)
- Strips React/JSX components (newsletters should use plain markdown)

### Best Practices

1. **Keep it simple**: Email clients have limited CSS support - avoid complex layouts
2. **Use absolute URLs**: For images and links, use full URLs (e.g., `https://dreamriver.eshaansood.in/posts/slug`)
3. **Test before sending**: Always test with `--test` flag before sending to all subscribers
4. **Subject lines**: Make newsletter subject lines compelling and clear
5. **Length**: Keep newsletters concise - long emails may be truncated
6. **Images**: Use images sparingly and ensure they're hosted publicly
7. **Links**: Test all links before sending

## Email Template

### Design Tokens

The email template uses these design tokens (from your site):

- **Backgrounds**: 
  - Main: `#D9DAD5` (paper-like off-white)
  - Card: `#F0F1ED` (posts/sections)
  - Soft: `#E7E9E3` (subtle panels)

- **Text Colors**:
  - Main: `#1F2A33` (soft charcoal)
  - Secondary: `#4F6473` (muted blue-grey)
  - Light: `#7C93A3` (metadata, dates)

- **Accent Colors**:
  - Blue Deep: `#094881` (links)
  - Orange Main: `#C14A23` (buttons)

### Email Structure

```
┌─────────────────────────────────┐
│ Email Body (background)         │
│  ┌───────────────────────────┐  │
│  │ Container (max-width:640px)│  │
│  │  ┌─────────────────────┐  │  │
│  │  │ Card (white)        │  │  │
│  │  │  ┌───────────────┐ │  │  │
│  │  │  │ Header        │ │  │  │
│  │  │  │ - Title       │ │  │  │
│  │  │  │ - Date        │ │  │  │
│  │  │  └───────────────┘ │  │  │
│  │  │  ┌───────────────┐ │  │  │
│  │  │  │ Content       │ │  │  │
│  │  │  │ (MDX → HTML)  │ │  │  │
│  │  │  └───────────────┘ │  │  │
│  │  │  ┌───────────────┐ │  │  │
│  │  │  │ Footer        │ │  │  │
│  │  │  │ - View online │ │  │  │
│  │  │  │ - Unsubscribe │ │  │  │
│  │  │  └───────────────┘ │  │  │
│  │  └─────────────────────┘  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## Automatic Email Sending (Webhook-Based)

The system uses a webhook-based approach for automatic email sending. When a post is published, your CMS/admin UI calls a Vercel API endpoint that sends emails to subscribers.

### How It Works

1. **Post Published**: When a post status changes to "published" in your CMS/admin UI
2. **Webhook Call**: Your backend calls `POST /api/email/new-post` with the post slug
3. **Idempotency Check**: The endpoint checks if email was already sent (prevents duplicates)
4. **Email Sending**: Fetches subscribers from Convex and sends via Postmark
5. **Mark as Sent**: Updates the post with `emailCampaignSentAt` timestamp

### Setup

1. **Environment Variables** (set in Vercel):
   - `CONVEX_URL` or `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL
   - `POSTMARK_SERVER_API_TOKEN` - Your Postmark API token
   - `POSTMARK_FROM_EMAIL` (optional) - Defaults to `newsletter@dreamriver.eshaansood.in`
   - `WEBHOOK_SECRET` (recommended) - Secret key for webhook authentication

2. **Configure Your CMS/Admin UI**:
   - When a post is published, make a POST request to `/api/email/new-post`
   - Include the post slug in the request body: `{ "slug": "your-post-slug" }`
   - Include webhook secret in Authorization header: `Bearer <WEBHOOK_SECRET>`

### Webhook Endpoint

**POST** `/api/email/new-post`

**Request Body:**
```json
{
  "slug": "your-post-slug",
  "webhookSecret": "optional-secret-from-body"
}
```

**Headers (optional but recommended):**
```
Authorization: Bearer <WEBHOOK_SECRET>
```

**Response:**
```json
{
  "success": true,
  "message": "Email campaign sent successfully",
  "slug": "your-post-slug",
  "sentCount": 42,
  "errorCount": 0,
  "sentAt": "2025-01-24T12:00:00.000Z"
}
```

### Idempotency

The endpoint is idempotent - calling it multiple times with the same slug will only send emails once. If emails were already sent, it returns:
```json
{
  "message": "Email campaign already sent for this post",
  "slug": "your-post-slug",
  "sentAt": "2025-01-24T10:00:00.000Z"
}
```

### Testing

Test the webhook endpoint:

```bash
# Using curl
curl -X POST https://your-domain.com/api/email/new-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{"slug": "your-post-slug"}'

# Or test locally
curl -X POST http://localhost:3000/api/email/new-post \
  -H "Content-Type: application/json" \
  -d '{"slug": "your-post-slug"}'
```

## Environment Variables

Required environment variables:

```bash
# Convex Database
CONVEX_URL=your_convex_url
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Postmark Email Service
POSTMARK_SERVER_API_TOKEN=your_postmark_token
POSTMARK_FROM_EMAIL=newsletter@dreamriver.eshaansood.in

# Blog URL (for unsubscribe links)
NEXT_PUBLIC_BLOG_URL=https://dreamriver.eshaansood.in
```

**Note**: These should be set as environment variables in Vercel for the webhook endpoint to work.

## Subscribers

### Subscriber Management

Subscribers are managed through Convex:

- **Add subscriber**: `api.subscribers.addSubscriber`
- **Unsubscribe**: `api.subscribers.unsubscribe`
- **Get active subscribers**: `api.subscribers.getAllSubscribers({ status: "active" })`

### Unsubscribe Links

Emails include unsubscribe links in the format:
```
https://dreamriver.eshaansood.in/unsubscribe?email=user@example.com
```

**Note**: You need to create an unsubscribe endpoint/page to handle unsubscribes.

## Troubleshooting

### Common Issues

1. **"Blog post not found"**
   - Verify the slug exists in Convex
   - Check that the post was migrated correctly

2. **"Newsletter not found"**
   - Verify the filename (without .mdx extension)
   - Check that the file exists in `newsletters/` directory

3. **"No active subscribers found"**
   - Check subscriber status in Convex
   - Verify subscribers have `status: "active"`

4. **Email sending fails**
   - Verify `POSTMARK_SERVER_API_TOKEN` is set
   - Check Postmark account limits and status
   - Review error messages in console output

5. **HTML rendering issues**
   - Email clients have limited CSS support
   - Test in multiple email clients (Gmail, Outlook, Apple Mail)
   - Use inline styles (already handled by the system)

### Testing

Always test emails before sending to all subscribers:

```bash
# Test blog post
npx tsx scripts/send-blog-post.ts <slug> --test your@email.com

# Test newsletter
npx tsx scripts/send-newsletter.ts <filename> --test your@email.com
```

## Examples

### Example Blog Post

```mdx
---
title: "Getting Started with TypeScript"
date: "2025-01-23"
summary: "Learn the basics of TypeScript and why it's useful"
tags: ["typescript", "programming", "tutorial"]
projectId: "playground"
slug: "getting-started-typescript"
---

# Getting Started with TypeScript

TypeScript is a powerful superset of JavaScript that adds static typing.

## Why TypeScript?

- **Type Safety**: Catch errors before runtime
- **Better IDE Support**: Autocomplete and refactoring
- **Documentation**: Types serve as inline documentation

## Basic Example

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

Ready to get started? Check out the [TypeScript documentation](https://www.typescriptlang.org/).
```

### Example Newsletter

```mdx
---
title: "Weekly Update - Week 3"
date: "2025-01-23"
subject: "This Week's Highlights"
---

# Weekly Update - Week 3

Here's what happened this week!

## New Blog Posts

- [Getting Started with TypeScript](/posts/getting-started-typescript)
- [Building with Next.js](/posts/building-nextjs)

## Project Updates

We've been working on:
- Email system improvements
- New feature additions
- Bug fixes

## Coming Next

Stay tuned for:
- More tutorials
- Project showcases
- Community features

---

*Have feedback? Reply to this email!*
```

## Additional Resources

- [Postmark Documentation](https://postmarkapp.com/developer)
- [MDX Documentation](https://mdxjs.com/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Email HTML Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)
