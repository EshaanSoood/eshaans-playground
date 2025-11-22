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
          Hey, my name is Eshaan Sood. I&apos;m a musician who also happens to be blind. in February 2025 I a few months before I was about to graduate from college, I asked a friend to help me build a website. I was a design student before I went blind and in a parallel universe, I would have just built my website myself. I had some very kind friends who didn&apos;t charge me their normal rate and helped me out. However as time went on my ideas of what I wanted grew more and more.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I also wanted to build accessible web experiences for my music projects. With a dep love of systems design and user experience and absolutely no coding knowledge what so ever, I decided to dip my toes into the dreaded pool of using AI to code. Through the three projects I have made so far, I went from asking someone to build me a basic website to building and shipping an interactive Next JS app.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          This blog outlines my journey of jumping back into the design world with accessibility first principles. So whether you are a developer, a fellow nerd or just someone curious I hope you find some interesting things along this story.
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

