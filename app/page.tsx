import Link from 'next/link'
import { getLatestPosts } from '@/lib/content'

function getWordPreview(content: string, wordCount: number = 30): string {
  const words = content.trim().split(/\s+/)
  if (words.length <= wordCount) {
    return content
  }
  return words.slice(0, wordCount).join(' ') + '...'
}

export default async function HomePage() {
  const latestPosts = await getLatestPosts(5)

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p>
          Cards pulled out at random. A place where all my interests converge.
        </p>
      </section>
      <section>
        <h2>Latest Posts</h2>
        <ul className="flex flex-col gap-6">
          {latestPosts.map((post) => (
            <li key={post.slug} className="flex flex-col gap-2">
              <Link href={`/posts/${post.slug}`}>
                <h3>{post.title}</h3>
              </Link>
              <time>{post.date}</time>
              <p>{getWordPreview(post.content)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

