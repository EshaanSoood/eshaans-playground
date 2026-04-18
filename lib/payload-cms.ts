const DEFAULT_CMS_URL = 'http://127.0.0.1:3001'

export interface Post {
  id: number | string
  title: string
  date: string
  summary: string
  tags: string[]
  projectId: string
  slug: string
  content: string
  published: boolean
  emailCampaignSentAt?: string | null
}

interface PayloadDocsResponse<T> {
  docs: T[]
}

interface PostUpsertInput {
  title: string
  date: string
  summary: string
  tags: string[]
  projectId: string
  slug: string
  content: string
  published?: boolean
}

function getCMSBaseURL() {
  return (process.env.PAYLOAD_CMS_URL || DEFAULT_CMS_URL).replace(/\/$/, '')
}

function getCMSWebhookSecret() {
  const secret = process.env.CMS_WEBHOOK_SECRET?.trim()

  if (!secret) {
    throw new Error('CMS_WEBHOOK_SECRET is not configured')
  }

  return secret
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean)
}

function normalizePost(doc: Record<string, unknown>): Post {
  return {
    id: (doc.id as number | string) ?? '',
    title: String(doc.title ?? ''),
    date: String(doc.date ?? ''),
    summary: String(doc.summary ?? ''),
    tags: normalizeTags(doc.tags),
    projectId: String(doc.projectId ?? 'playground'),
    slug: String(doc.slug ?? ''),
    content: String(doc.content ?? ''),
    published: Boolean(doc.published),
    emailCampaignSentAt:
      typeof doc.emailCampaignSentAt === 'string' ? doc.emailCampaignSentAt : null,
  }
}

function buildPostsQuery(options: {
  slug?: string
  limit?: number
  publishedOnly?: boolean
}) {
  const params = new URLSearchParams()
  params.set('depth', '0')
  params.set('sort', '-date')
  params.set('limit', String(options.limit ?? 100))

  if (options.slug) {
    params.set('where[slug][equals]', options.slug)
  }

  if (options.publishedOnly) {
    params.set('where[published][equals]', 'true')
  }

  return params.toString()
}

async function cmsFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getCMSBaseURL()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message =
      payload?.errors?.[0]?.message ||
      payload?.message ||
      payload?.error ||
      `CMS request failed with status ${response.status}`
    throw new Error(message)
  }

  return payload as T
}

function cmsWriteHeaders() {
  return {
    'x-cms-webhook-secret': getCMSWebhookSecret(),
  }
}

export async function getPublishedPosts(limit = 100): Promise<Post[]> {
  try {
    const data = await cmsFetch<PayloadDocsResponse<Record<string, unknown>>>(
      `/api/posts?${buildPostsQuery({ limit, publishedOnly: true })}`
    )

    return data.docs.map(normalizePost)
  } catch (error) {
    console.warn('Failed to fetch published posts from Payload CMS:', error)
    return []
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  try {
    const data = await cmsFetch<PayloadDocsResponse<Record<string, unknown>>>(
      `/api/posts?${buildPostsQuery({ slug, limit: 1, publishedOnly: true })}`
    )

    return data.docs[0] ? normalizePost(data.docs[0]) : null
  } catch (error) {
    console.warn(`Failed to fetch published post "${slug}" from Payload CMS:`, error)
    return null
  }
}

export async function getManagedPostBySlug(slug: string): Promise<Post | null> {
  const data = await cmsFetch<PayloadDocsResponse<Record<string, unknown>>>(
    `/api/posts?${buildPostsQuery({ slug, limit: 1 })}`,
    {
      headers: cmsWriteHeaders(),
    }
  )

  return data.docs[0] ? normalizePost(data.docs[0]) : null
}

export async function upsertManagedPost(input: PostUpsertInput) {
  const existing = await getManagedPostBySlug(input.slug)
  const body = JSON.stringify({
    ...input,
    published: input.published ?? true,
  })

  if (existing) {
    const updated = await cmsFetch<Record<string, unknown>>(`/api/posts/${existing.id}`, {
      method: 'PATCH',
      headers: cmsWriteHeaders(),
      body,
    })

    return {
      post: normalizePost(updated),
      created: false,
    }
  }

  const created = await cmsFetch<Record<string, unknown>>('/api/posts', {
    method: 'POST',
    headers: cmsWriteHeaders(),
    body,
  })

  return {
    post: normalizePost(created),
    created: true,
  }
}

export async function markManagedPostEmailSent(id: number | string, sentAt: string) {
  const updated = await cmsFetch<Record<string, unknown>>(`/api/posts/${id}`, {
    method: 'PATCH',
    headers: cmsWriteHeaders(),
    body: JSON.stringify({
      emailCampaignSentAt: sentAt,
    }),
  })

  return normalizePost(updated)
}
