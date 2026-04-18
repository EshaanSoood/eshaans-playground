import Link from 'next/link'
import { getAllPosts, type Post } from '@/lib/content'
import { PostCard } from '@/components/PostCard'
import { formatPostDate } from '@/lib/post-display'

export const dynamic = 'force-dynamic'
export const revalidate = 60

function groupPostsByDate(posts: Post[]): Map<string, Post[]> {
  const grouped = new Map<string, Post[]>()

  for (const post of posts) {
    const dateKey = post.date

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }

    grouped.get(dateKey)!.push(post)
  }

  return grouped
}

export default async function PostsPage() {
  const allPosts = await getAllPosts()
  const groupedPosts = groupPostsByDate(allPosts)

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-[2rem] border border-white/60 bg-white/60 p-8 shadow-paper sm:p-10">
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">Archive</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="mb-2">All Posts</h1>
            <p className="m-0 text-base leading-8 text-text-secondary sm:text-lg">
              Every published note from the playground, grouped by date and arranged like a proper
              extension of the main site instead of a side project.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-main no-underline transition hover:text-orange-deep"
          >
            Back to latest
          </Link>
        </div>
      </section>

      <div className="flex flex-col gap-10">
        {Array.from(groupedPosts.entries()).map(([date, posts]) => (
          <section key={date} className="grid gap-5 lg:grid-cols-[220px_1fr] lg:gap-8">
            <div className="lg:pt-5">
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">
                Published
              </p>
              <h2 className="mb-0 text-2xl sm:text-[2.2rem]">{formatPostDate(date)}</h2>
            </div>
            <ul className="grid gap-6">
              {posts.map((post) => (
                <li key={post.slug}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
