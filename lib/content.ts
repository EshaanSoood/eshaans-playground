import {
  getPublishedPostBySlug,
  getPublishedPosts,
  type Post,
} from '@/lib/payload-cms'

export type { Post }

export async function getAllPosts(): Promise<Post[]> {
  return getPublishedPosts(100)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return getPublishedPostBySlug(slug)
}

export async function getLatestPosts(count: number = 5): Promise<Post[]> {
  return getPublishedPosts(count)
}

export function getPostsByProjectId(projectId: string) {
  return []
}

export function groupPostsByProject() {
  return {}
}
