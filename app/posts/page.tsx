'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getAllPosts, type Post } from '@/lib/content'

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

export default function PostsPage() {
  const [allPosts] = useState<Post[]>(getAllPosts())
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initialPosts = allPosts.slice(0, POSTS_PER_PAGE)
    setDisplayedPosts(initialPosts)
  }, [allPosts])

  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = currentPage + 1
          const nextPosts = allPosts.slice(0, nextPage * POSTS_PER_PAGE)
          if (nextPosts.length > displayedPosts.length) {
            setDisplayedPosts(nextPosts)
            setCurrentPage(nextPage)
          }
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinelRef.current)

    return () => {
      observer.disconnect()
    }
  }, [currentPage, allPosts, displayedPosts.length])

  const groupedPosts = groupPostsByDate(displayedPosts)
  const hasMore = displayedPosts.length < allPosts.length

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
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          <span className="sr-only">Loading more posts...</span>
        </div>
      )}
    </div>
  )
}

