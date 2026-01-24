import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts } from '@/lib/content'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { Metadata } from 'next'

interface PostPageProps {
  params: Promise<{
    slug: string
  }> | {
    slug: string
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Force dynamic rendering to fetch posts at request time
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every 60 seconds

// Note: generateStaticParams is disabled to allow dynamic post fetching
// Posts are fetched at request time from Convex

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  // Handle Next.js 16 params which might be a Promise
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return {
      title: "Eshaan's Playground.",
    }
  }
  
  return {
    title: `${post.title} | Eshaan's Playground.`,
    description: post.summary || post.content.slice(0, 160).replace(/\n/g, ' ').trim() + '...',
  }
}

export default async function PostPage({ params }: PostPageProps) {
  // Handle Next.js 16 params which might be a Promise
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const post = await getPostBySlug(slug);

  if (!post) {
    console.error(`Post not found for slug: ${slug}`);
    notFound();
  }

  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <h1 id={`post-${slug}`}>{post.title}</h1>
        <time>{formatDate(post.date)}</time>
      </header>
      <div>
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              rehypePlugins: [
                rehypeHighlight,
                rehypeSlug,
                [
                  rehypeAutolinkHeadings,
                  {
                    behavior: 'wrap',
                    properties: {
                      className: ['anchor'],
                    },
                  },
                ],
              ],
            },
          }}
        />
      </div>
    </article>
  )
}

