import Link from 'next/link'
import type { Post } from '@/lib/content'
import { formatPostDate, getReadingTimeLabel, getWordPreview } from '@/lib/post-display'

interface PostCardProps {
  post: Post
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const excerpt = post.summary || getWordPreview(post.content, featured ? 44 : 28)
  const tags = post.tags.slice(0, 3)

  return (
    <article
      className={[
        'group flex h-full flex-col rounded-[2rem] border border-border-light bg-bg-card/90 p-6 shadow-paper transition duration-300 hover:-translate-y-1 hover:border-blue-deep/30 hover:shadow-paper-strong sm:p-8',
        featured ? 'gap-5' : 'gap-4',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-text-light">
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        <span className="h-1 w-1 rounded-full bg-orange-main/60" aria-hidden="true" />
        <span>{getReadingTimeLabel(post.content)}</span>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <Link href={`/posts/${post.slug}`} className="no-underline">
          <h2 className={featured ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-[1.85rem]'}>
            {post.title}
          </h2>
        </Link>
        <p className="m-0 text-base leading-8 text-text-secondary">{excerpt}</p>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-blue-deep/15 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.16em] text-text-secondary"
          >
            {tag}
          </span>
        ))}
        <Link
          href={`/posts/${post.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-orange-main no-underline transition hover:text-orange-deep"
        >
          Read entry
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </article>
  )
}
