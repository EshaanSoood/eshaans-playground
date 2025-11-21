import Link from 'next/link'
import { getLatestPosts } from '@/lib/content'
import { PostCard } from '@/components/PostCard'

export default function HomePage() {
  const latestPosts = getLatestPosts(5)

  return (
    <div className="space-y-12">
      {/* Intro Section */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to Eshaan&apos;s Playground
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Hi, I&apos;m Eshaan. This blog showcases my non-music dev projects and the process
          behind them. It&apos;s a narrative journey from asking a friend to build my site to
          shipping my own Next.js projects in ~9 months.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I write about accessibility, thoughtful UX, and the technical decisions that shape
          the projects I build. Whether you&apos;re a developer, hiring manager, or someone
          interested in accessible web experiences, I hope you find something valuable here.
        </p>
      </section>

      {/* Latest Posts */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Latest Posts
          </h2>
          <Link
            href="/timeline"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-4">
          {latestPosts.length > 0 ? (
            latestPosts.map((post) => <PostCard key={post.slug} post={post} />)
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No posts yet. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/timeline"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Timeline
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            href="/projects"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Projects
          </Link>
          <span className="text-gray-400">•</span>
          <a
            href="https://www.eshaansood.in"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Main site
          </a>
        </div>
      </section>
    </div>
  )
}

