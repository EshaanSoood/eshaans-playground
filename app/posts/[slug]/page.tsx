import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts } from '@/lib/content'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { Metadata } from 'next'

interface PostPageProps {
  params: {
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

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts()
    // Return empty array if no posts - Next.js will handle this gracefully
    if (!posts || posts.length === 0) {
      return []
    }
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.warn("Failed to generate static params:", error)
    // Return empty array to allow build to succeed
    return []
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  
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
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <h1>{post.title}</h1>
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

