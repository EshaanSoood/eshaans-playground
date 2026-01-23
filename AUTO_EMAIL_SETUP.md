# Automatic Email Sending Setup Guide (Webhook-Based)

This guide explains how to set up automatic email sending when new blog posts are published using the webhook-based approach.

## Overview

Instead of using GitHub Actions, emails are sent via a webhook endpoint that your CMS/admin UI calls when a post is published. This approach is:

- **Immediate**: Email goes out right when you publish
- **Idempotent**: Guaranteed to send once per post
- **No polling**: No cron jobs or GitHub runners
- **Easier to secure**: Webhook authentication and rate limiting

## Quick Setup

### 1. Configure Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables

Add these variables:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `CONVEX_URL` or `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL | `https://your-project.convex.cloud` |
| `POSTMARK_SERVER_API_TOKEN` | Postmark Server API Token | `your-token-here` |
| `POSTMARK_FROM_EMAIL` | (Optional) From email address | `newsletter@dreamriver.eshaansood.in` |
| `WEBHOOK_SECRET` | (Recommended) Secret for webhook auth | `your-random-secret-here` |

### 2. Configure Your CMS/Admin UI

When a post is published, make a POST request to your webhook endpoint:

```typescript
// Example: Call webhook when post is published
async function publishPost(postSlug: string) {
  // ... your publish logic ...
  
  // Call webhook to send emails
  const response = await fetch('https://your-domain.com/api/email/new-post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`,
    },
    body: JSON.stringify({
      slug: postSlug,
    }),
  });
  
  const result = await response.json();
  console.log('Email campaign result:', result);
}
```

### 3. That's It!

When you publish a post, emails will be sent automatically to all active subscribers.

## How It Works

1. **Post Published**: Your CMS/admin UI publishes a post (status → "published")
2. **Webhook Call**: Backend calls `POST /api/email/new-post` with the post slug
3. **Idempotency Check**: Endpoint checks if email was already sent (prevents duplicates)
4. **Fetch Subscribers**: Gets all active subscribers from Convex
5. **Send Emails**: Sends batch emails via Postmark
6. **Mark as Sent**: Updates post with `emailCampaignSentAt` timestamp

## Webhook Endpoint Details

### Endpoint
`POST /api/email/new-post`

### Request Body
```json
{
  "slug": "your-post-slug"
}
```

### Authentication (Recommended)

Include webhook secret in Authorization header:
```
Authorization: Bearer YOUR_WEBHOOK_SECRET
```

Or include in request body:
```json
{
  "slug": "your-post-slug",
  "webhookSecret": "YOUR_WEBHOOK_SECRET"
}
```

### Response (Success)
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

### Response (Already Sent)
```json
{
  "message": "Email campaign already sent for this post",
  "slug": "your-post-slug",
  "sentAt": "2025-01-24T10:00:00.000Z"
}
```

## Testing

### Test Locally

```bash
# Start your dev server
npm run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:3000/api/email/new-post \
  -H "Content-Type: application/json" \
  -d '{"slug": "your-post-slug"}'
```

### Test in Production

```bash
curl -X POST https://your-domain.com/api/email/new-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{"slug": "your-post-slug"}'
```

## Integration Examples

### Convex Mutation Example

If you're using Convex mutations to publish posts:

```typescript
// convex/posts.ts
export const publishPost = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    // Update post status to published
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    
    if (post) {
      await ctx.db.patch(post._id, {
        published: true,
        publishedAt: Date.now(),
      });
      
      // Call webhook to send emails
      // Note: You'll need to call this from your backend/API route
      // since Convex mutations can't directly call external APIs
    }
  },
});
```

Then in your API route or action:

```typescript
// app/api/publish-post/route.ts
import { ConvexHttpClient } from "convex/browser";

export async function POST(request: Request) {
  const { slug } = await request.json();
  
  // Publish in Convex
  const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
  await convex.mutation(api.posts.publishPost, { slug });
  
  // Send emails via webhook
  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/email/new-post`;
  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`,
    },
    body: JSON.stringify({ slug }),
  });
  
  return Response.json({ success: true });
}
```

## Troubleshooting

### Webhook Returns 401 Unauthorized

- Verify `WEBHOOK_SECRET` is set in Vercel environment variables
- Check that Authorization header matches: `Bearer YOUR_WEBHOOK_SECRET`
- Or include `webhookSecret` in request body

### Webhook Returns 404 Post Not Found

- Verify the post slug exists in Convex
- Check that the post was created/migrated correctly
- Ensure Convex URL is configured correctly

### Emails Not Sending

- Check Vercel function logs for errors
- Verify `POSTMARK_SERVER_API_TOKEN` is set
- Ensure there are active subscribers in Convex
- Check Postmark account limits and status

### Duplicate Emails

- The endpoint is idempotent - it checks `emailCampaignSentAt` before sending
- If you see duplicates, check that the post's `emailCampaignSentAt` field is being set correctly
- Verify you're not calling the webhook multiple times for the same post

## Security Best Practices

1. **Always use WEBHOOK_SECRET**: Don't expose the endpoint publicly without authentication
2. **Rate limiting**: Consider adding rate limiting to prevent abuse
3. **Validate input**: Ensure slug is valid before processing
4. **Monitor logs**: Check Vercel function logs regularly for suspicious activity

## Migration from GitHub Actions

If you were previously using GitHub Actions:

1. ✅ Remove `.github/workflows/auto-send-emails.yml` (already done)
2. ✅ Set up Vercel environment variables
3. ✅ Configure your CMS/admin UI to call the webhook
4. ✅ Test the webhook endpoint
5. ✅ Monitor first few sends to ensure everything works

The old `scripts/auto-send-emails.ts` script is still available for manual/legacy use but is no longer needed for automatic sending.
