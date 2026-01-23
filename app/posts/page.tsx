import Link from 'next/link'
import { getAllPosts, type Post } from '@/lib/content'

// Force dynamic rendering to fetch posts at request time
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every 60 seconds

function getWordPreview(content: string, wordCount: number = 30): string {
  const words = content.trim().split(/\s+/)
  if (words.length <= wordCount) {
    return content
  }
  return words.slice(0, wordCount).join(' ') + '...'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

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

const POSTS_PER_PAGE = 10

export default async function PostsPage() {
  const allPosts = await getAllPosts()
  const groupedPosts = groupPostsByDate(allPosts)

  return (
    <div className="flex flex-col gap-8">
      <h1>All Posts</h1>
      <div className="flex flex-col gap-8">
        {Array.from(groupedPosts.entries()).map(([date, posts]) => (
          <section key={date} className="flex flex-col gap-4">
            <h2>{formatDate(date)}</h2>
            <ul className="flex flex-col gap-6">
              {posts.map((post) => (
                <li key={post.slug} className="flex flex-col gap-2">
                  <Link href={`/posts/${post.slug}`}>
                    <h3>{post.title}</h3>
                  </Link>
                  <p>{getWordPreview(post.content)}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

