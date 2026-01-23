# Convex Setup Guide

## Current Status

✅ **Convex integration is complete and ready!**
- All Convex functions are defined (`convex/posts.ts`)
- Schema is configured (`convex/schema.ts`)
- Content layer uses Convex (`src/lib/content.ts`)
- Build works with placeholder types
- TypeScript errors resolved

## Next Steps to Complete Setup

### 1. Initialize Convex Project

Run this command in your terminal (you're already logged in):

```bash
npx convex dev
```

This will:
- Create a new Convex project (or connect to existing one)
- Generate proper TypeScript types in `convex/_generated/`
- Provide your `CONVEX_URL`

**Note:** The command will run in watch mode. You can stop it after it generates the types, or keep it running for development.

### 2. Set Environment Variable

After initialization, you'll get a `CONVEX_URL`. Create a `.env` file in the project root:

```bash
CONVEX_URL=https://your-project.convex.cloud
```

### 3. Verify Setup

1. **Check generated files:**
   ```bash
   ls -la convex/_generated/
   ```
   You should see: `api.d.ts`, `api.js`, `server.d.ts`, `dataModel.d.ts`

2. **Test the build:**
   ```bash
   npm run build
   ```

3. **Test locally:**
   ```bash
   npm run dev
   ```

### 4. Migrate Posts to Convex

Once Convex is initialized, you can add posts using:

**Option A: Use the migration script** (if you have MDX files in `posts/` directory):
```bash
# Set CONVEX_URL in your environment first
export CONVEX_URL=your_url_here
npx tsx scripts/migrate-posts.ts
```

**Option B: Add posts via Convex Dashboard:**
1. Go to your Convex dashboard
2. Navigate to Data → posts table
3. Add posts manually

**Option C: Use the insertPost mutation:**
```typescript
// In a script or via Convex dashboard functions
await convex.mutation("posts:insertPost", {
  title: "My Post",
  date: "2024-01-01",
  summary: "Post summary",
  tags: ["tag1", "tag2"],
  projectId: "",
  slug: "my-post",
  content: "# My Post\n\nContent here..."
});
```

## File Structure

```
convex/
  ├── schema.ts          # Database schema
  ├── posts.ts           # Query and mutation functions
  └── _generated/        # Auto-generated (after `convex dev`)
      ├── api.d.ts       # Type-safe API references
      ├── api.js         # Runtime API
      ├── server.d.ts    # Server types
      └── dataModel.d.ts # Data model types

src/lib/
  └── content.ts         # Uses Convex to fetch posts
```

## Functions Available

- `getAllPosts()` - Get all posts sorted by date
- `getPostBySlug(slug)` - Get a single post by slug
- `getLatestPosts(count)` - Get latest N posts
- `insertPost(...)` - Insert or update a post

## Troubleshooting

**Build fails with "Cannot find module convex/_generated/api":**
- Run `npx convex dev` first to generate the files

**TypeScript errors in convex/posts.ts:**
- The placeholder types will be replaced when you run `convex dev`
- After initialization, types will be properly generated

**Empty posts array:**
- Make sure `CONVEX_URL` is set in your `.env` file
- Verify posts exist in your Convex database
- Check browser console for any Convex errors

## Production Deployment

For Vercel:
1. Set `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_URL` as environment variables in Vercel settings
2. The build will fetch posts from Convex at build time
3. Posts are statically generated for optimal performance
