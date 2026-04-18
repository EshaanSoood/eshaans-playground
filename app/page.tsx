import Link from 'next/link'
import { getLatestPosts } from '@/lib/content'
import { PostCard } from '@/components/PostCard'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function HomePage() {
  const latestPosts = await getLatestPosts(5)
  const [featuredPost, ...remainingPosts] = latestPosts

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-start">
        <div className="rounded-[2rem] border border-white/60 bg-white/60 p-8 shadow-paper sm:p-10">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-text-light">
            <span className="rounded-full border border-orange-main/20 bg-orange-soft/35 px-3 py-1 text-orange-deep">
              Blog
            </span>
            <span>Integrated into the main site's visual language</span>
          </div>

          <h1 className="max-w-4xl text-[3.3rem] leading-[0.95] sm:text-[4.5rem]">
            Eshaan&apos;s Playground
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
            Cards pulled out at random. A place where music, process, technology, and the human
            mess all converge. This is the journal side of the website now, not a separate product.
          </p>

          <div className="flex flex-wrap gap-3 pt-3">
            <Link
              href="/posts"
              className="inline-flex items-center rounded-full border border-orange-main bg-orange-main px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white no-underline transition hover:bg-orange-deep"
            >
              Browse the archive
            </Link>
            <a
              href="https://eshaansood.in"
              className="inline-flex items-center rounded-full border border-blue-deep/15 bg-white/80 px-5 py-3 text-sm font-medium text-text-secondary no-underline transition hover:border-blue-deep/30 hover:text-text-main"
            >
              Visit the main site
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-blue-deep/10 bg-blue-soft/15 p-6 shadow-paper">
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">What lives here</p>
            <p className="m-0 text-base leading-8 text-text-secondary">
              New writing, experiments, and the connective tissue behind the bigger public-facing
              projects.
            </p>
          </div>
          <div className="rounded-[2rem] border border-orange-main/10 bg-white/75 p-6 shadow-paper">
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">Where to go next</p>
            <p className="m-0 text-base leading-8 text-text-secondary">
              Use the subscribe button in the header for the newsletter, or jump out to the main
              site for the polished pages.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">Fresh notes</p>
            <h2 className="mb-0">Latest Posts</h2>
          </div>
          <Link
            href="/posts"
            className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-main no-underline transition hover:text-orange-deep"
          >
            See all posts
          </Link>
        </div>

        {featuredPost ? (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <PostCard post={featuredPost} featured />
            <div className="grid gap-6">
              {remainingPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-border-light bg-white/70 p-8 text-text-secondary shadow-paper">
            No published posts yet.
          </div>
        )}
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-white/60 bg-white/60 p-8 shadow-paper lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">Integrated now</p>
          <h2 className="mb-3">The blog is finally part of the same house.</h2>
          <p className="m-0 text-base leading-8 text-text-secondary">
            The shell, footer, and navigation now point back to the same main-site routes and use
            the same warm paper palette instead of the old disconnected gray UI.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-blue-deep/10 bg-blue-soft/15 p-6">
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">Under the hood</p>
          <p className="m-0 text-base leading-8 text-text-secondary">
            Posts come from the external Payload CMS and newsletter subscriptions run through
            Listmonk. The blog frontend is now just the reading experience.
          </p>
        </div>
      </section>
    </div>
  )
}
