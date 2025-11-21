import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

export interface PostFrontmatter {
  title: string
  date: string
  summary: string
  tags?: string[]
  slug?: string
  coverImage?: string
  projectId?: string
  projectRepoUrl?: string
  liveDemoUrl?: string
}

export interface Post extends PostFrontmatter {
  slug: string
  content: string
  readingTime: {
    text: string
    minutes: number
  }
}

const postsDirectory = path.join(process.cwd(), 'posts')

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter((name) => name.endsWith('.mdx'))
    .map((fileName) => {
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      // Derive slug from filename if not provided
      const slug = data.slug || fileName.replace(/\.mdx$/, '')

      // Calculate reading time
      const readingTimeResult = readingTime(content)

      return {
        ...data,
        slug,
        content,
        readingTime: {
          text: readingTimeResult.text,
          minutes: readingTimeResult.minutes,
        },
      } as Post
    })

  // Sort by date (newest first)
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const allPosts = getAllPosts()
    return allPosts.find((post) => post.slug === slug) || null
  } catch (error) {
    return null
  }
}

export function getPostsByProjectId(projectId: string): Post[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) => post.projectId === projectId)
}

export function groupPostsByProject(): Record<string, Post[]> {
  const allPosts = getAllPosts()
  const grouped: Record<string, Post[]> = {}

  allPosts.forEach((post) => {
    if (post.projectId) {
      if (!grouped[post.projectId]) {
        grouped[post.projectId] = []
      }
      grouped[post.projectId].push(post)
    }
  })

  // Sort posts within each project by date (newest first)
  Object.keys(grouped).forEach((projectId) => {
    grouped[projectId].sort((a, b) => {
      if (a.date < b.date) {
        return 1
      } else {
        return -1
      }
    })
  })

  return grouped
}

export function getLatestPosts(count: number = 5): Post[] {
  const allPosts = getAllPosts()
  return allPosts.slice(0, count)
}

