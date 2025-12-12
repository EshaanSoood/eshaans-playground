import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface Post {
  title: string
  date: string
  summary: string
  tags: string[]
  projectId: string
  slug: string
  content: string
}

function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.mdx'))
}

function getPostBySlugFile(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    title: data.title || '',
    date: data.date || '',
    summary: data.summary || '',
    tags: data.tags || [],
    projectId: data.projectId || '',
    slug: data.slug || slug,
    content,
  }
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => {
      const slugWithoutExt = slug.replace(/\.mdx$/, '')
      return getPostBySlugFile(slugWithoutExt)
    })
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      // Sort by date, newest first
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  return posts
}

export function getPostBySlug(slug: string): Post | null {
  return getPostBySlugFile(slug)
}

export function getLatestPosts(count: number = 5): Post[] {
  const allPosts = getAllPosts()
  return allPosts.slice(0, count)
}

export function getPostsByProjectId(projectId: string) {
  return []
}

export function groupPostsByProject() {
  return {}
}

