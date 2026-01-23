# Automatic Email Sending Setup Guide

This guide explains how to set up automatic email sending when new blog posts or newsletters are pushed to the repository.

## Quick Setup

### 1. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `CONVEX_URL` | Your Convex deployment URL | `https://your-project.convex.cloud` |
| `POSTMARK_SERVER_API_TOKEN` | Postmark Server API Token | `your-token-here` |
| `POSTMARK_FROM_EMAIL` | (Optional) From email address | `newsletter@dreamriver.eshaansood.in` |
| `NEXT_PUBLIC_BLOG_URL` | (Optional) Blog URL for unsubscribe links | `https://dreamriver.eshaansood.in` |

### 2. Push Your Content

That's it! When you push new blog posts or newsletters:

- **Blog Posts**: Add a new `.mdx` file to `posts/` and push → Automatically migrated to Convex and sent to subscribers
- **Newsletters**: Add a new `.mdx` file to `newsletters/` and push → Automatically sent to subscribers

## How It Works

1. **GitHub Actions Workflow** (`.github/workflows/auto-send-emails.yml`)
   - Triggers on push to `main`/`master` branch
   - Only runs when files in `posts/` or `newsletters/` change
   - Uses the `auto-send-emails.ts` script

2. **Auto-Send Script** (`scripts/auto-send-emails.ts`)
   - Detects new/modified `.mdx` files
   - For blog posts: Migrates to Convex, then sends emails
   - For newsletters: Sends emails directly
   - Logs all actions and results

## Testing

Before pushing, test locally:

```bash
# Test blog post
npx tsx scripts/send-blog-post.ts <slug> --test your@email.com

# Test newsletter  
npx tsx scripts/send-newsletter.ts <filename> --test your@email.com
```

## Monitoring

Check workflow runs:
1. Go to your repository → Actions tab
2. Click on "Auto Send Emails" workflow
3. View logs to see what was sent and any errors

## Troubleshooting

### Workflow Not Running

- Check that files are in `posts/` or `newsletters/` directories
- Verify you're pushing to `main` or `master` branch
- Check workflow file syntax in `.github/workflows/auto-send-emails.yml`

### Emails Not Sending

- Verify all GitHub Secrets are set correctly
- Check workflow logs for error messages
- Ensure Postmark API token has correct permissions
- Verify Convex URL is correct and accessible

### Duplicate Emails

- The script checks if blog posts already exist in Convex before migrating
- Modified files will trigger re-sending (by design)
- To prevent duplicates, only push new files, not modifications

## Manual Trigger

You can manually trigger the workflow:
1. Go to Actions → Auto Send Emails
2. Click "Run workflow"
3. Select branch and run

## Disabling Automatic Sending

To temporarily disable automatic sending:
1. Edit `.github/workflows/auto-send-emails.yml`
2. Comment out or remove the workflow file
3. Or add a condition to skip execution

## Best Practices

1. **Always test first**: Use `--test` flag before pushing
2. **Review content**: Double-check your content before pushing
3. **Monitor results**: Check workflow logs after pushing
4. **Use meaningful commits**: Clear commit messages help track what was sent
5. **Don't modify sent content**: Avoid modifying files after they've been sent (unless intentional)
