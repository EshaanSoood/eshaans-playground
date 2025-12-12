import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts } from '@/lib/content'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

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
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function PostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug)

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

