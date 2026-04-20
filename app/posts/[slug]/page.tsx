import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { getPostBySlug } from '@/lib/content'
import { formatPostDate, getReadingTimeLabel } from '@/lib/post-display'
import { MAIN_SITE_LINKS } from '@/lib/links'
import { mdxComponents } from '@/lib/mdx-components'

interface PostPageProps {
  params:
    | Promise<{
        slug: string
      }>
    | {
        slug: string
      }
}

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: "Eshaan's Playground.",
    }
  }

  return {
    title: `${post.title} | Eshaan's Playground.`,
    description: post.summary || `${post.content.slice(0, 160).replace(/\n/g, ' ').trim()}...`,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const post = await getPostBySlug(slug)

  if (!post) {
    console.error(`Post not found for slug: ${slug}`)
    notFound()
  }

  const projectsLink = MAIN_SITE_LINKS.find((link) => link.label === 'Projects')?.href
  const contactLink = MAIN_SITE_LINKS.find((link) => link.label === 'Contact')?.href

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
      <article className="rounded-[2rem] border border-white/60 bg-white/65 p-6 shadow-paper sm:p-8 lg:p-10">
        <header className="flex flex-col gap-5 border-b border-border-light/70 pb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-text-light">
            <Link
              href="/posts"
              className="rounded-full border border-blue-deep/15 bg-blue-soft/20 px-3 py-1 text-text-secondary no-underline transition hover:text-text-main"
            >
              Archive
            </Link>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span>{getReadingTimeLabel(post.content)}</span>
          </div>

          <div className="flex flex-col gap-4">
            <h1 id={`post-${slug}`} className="max-w-4xl">
              {post.title}
            </h1>
            {post.summary ? (
              <p className="m-0 max-w-3xl text-lg leading-8 text-text-secondary sm:text-xl">
                {post.summary}
              </p>
            ) : null}
          </div>

          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-orange-main/15 bg-orange-soft/30 px-3 py-1 text-xs uppercase tracking-[0.14em] text-orange-deep"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="post-body pt-8">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
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

      <aside className="grid gap-5 xl:sticky xl:top-40">
        <div className="rounded-[2rem] border border-blue-deep/12 bg-blue-soft/18 p-6 shadow-paper">
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">
            Part of the wider site
          </p>
          <p className="m-0 text-base leading-8 text-text-secondary">
            This post lives inside the blog, but the broader project, lessons, and collaboration
            pages still live on the main site.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-paper">
          <h2 className="mb-3 text-2xl">Keep moving</h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/posts"
              className="inline-flex items-center justify-between rounded-2xl border border-blue-deep/12 bg-white/80 px-4 py-3 text-sm font-medium text-text-secondary no-underline transition hover:border-blue-deep/28 hover:text-text-main"
            >
              More writing
              <span aria-hidden="true">&rarr;</span>
            </Link>
            {projectsLink ? (
              <a
                href={projectsLink}
                className="inline-flex items-center justify-between rounded-2xl border border-blue-deep/12 bg-white/80 px-4 py-3 text-sm font-medium text-text-secondary no-underline transition hover:border-blue-deep/28 hover:text-text-main"
              >
                Main site projects
                <span aria-hidden="true">&rarr;</span>
              </a>
            ) : null}
            {contactLink ? (
              <a
                href={contactLink}
                className="inline-flex items-center justify-between rounded-2xl border border-blue-deep/12 bg-white/80 px-4 py-3 text-sm font-medium text-text-secondary no-underline transition hover:border-blue-deep/28 hover:text-text-main"
              >
                Get in touch
                <span aria-hidden="true">&rarr;</span>
              </a>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  )
}
