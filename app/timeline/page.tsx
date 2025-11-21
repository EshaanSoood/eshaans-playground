import { getAllPosts } from '@/lib/content'
import { PostCard } from '@/components/PostCard'

export default function TimelinePage() {
  // Get all posts sorted chronologically (newest first)
  const allPosts = getAllPosts()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Timeline
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          All posts in chronological order
        </p>
      </div>

      <div className="space-y-4">
        {allPosts.length > 0 ? (
          allPosts.map((post) => <PostCard key={post.slug} post={post} />)
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No posts yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  )
}

