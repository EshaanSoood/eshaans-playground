import { LISTMONK_BASE_URL } from './listmonk-public'

const DEFAULT_BLOG_LIST_ID = 3
const DEFAULT_FROM_EMAIL = 'Eshaan Sood <no-reply@eshaansood.org>'

function trimEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

function getListmonkAuthHeader() {
  const explicitHeader = trimEnv('LISTMONK_API_AUTH_HEADER')
  if (explicitHeader) {
    return explicitHeader
  }

  const credentials = trimEnv('LISTMONK_API_CREDENTIALS')
  if (credentials) {
    return `token ${credentials}`
  }

  const user = trimEnv('LISTMONK_API_USER')
  const token = trimEnv('LISTMONK_API_TOKEN')
  if (user && token) {
    return `token ${user}:${token}`
  }

  throw new Error(
    'Listmonk admin credentials are not configured. Set LISTMONK_API_CREDENTIALS or LISTMONK_API_USER + LISTMONK_API_TOKEN.'
  )
}

function getListmonkAdminBaseUrl() {
  return (trimEnv('LISTMONK_BASE_URL') || LISTMONK_BASE_URL).replace(/\/$/, '')
}

function getBlogListId() {
  const raw = trimEnv('LISTMONK_BLOG_LIST_ID')
  const parsed = raw ? Number(raw) : DEFAULT_BLOG_LIST_ID

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid LISTMONK_BLOG_LIST_ID value: ${raw}`)
  }

  return parsed
}

export function getListmonkFromEmail() {
  return trimEnv('LISTMONK_FROM_EMAIL') || DEFAULT_FROM_EMAIL
}

async function listmonkAdminFetch<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${getListmonkAdminBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: getListmonkAuthHeader(),
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Listmonk request failed with status ${response.status}`
    throw new Error(message)
  }

  return payload as T
}

export async function createAndStartCampaign(input: {
  name: string
  subject: string
  body: string
  altbody?: string
  tags?: string[]
}) {
  const created = await listmonkAdminFetch<{ data: { id: number } }>('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      subject: input.subject,
      lists: [getBlogListId()],
      from_email: getListmonkFromEmail(),
      type: 'regular',
      content_type: 'html',
      messenger: 'email',
      body: input.body,
      altbody: input.altbody,
      tags: input.tags || [],
    }),
  })

  const campaignId = created.data.id

  await listmonkAdminFetch(`/api/campaigns/${campaignId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'running' }),
  })

  return campaignId
}

function escapeSQLString(value: string) {
  return value.replace(/'/g, "''")
}

export async function unsubscribeEmailFromBlogList(email: string) {
  const query = encodeURIComponent(`subscribers.email = '${escapeSQLString(email)}'`)
  const listId = getBlogListId()
  const result = await listmonkAdminFetch<{
    data?: { results?: Array<{ id: number }> }
  }>(`/api/subscribers?list_id=${listId}&page=1&per_page=100&query=${query}`, {
    method: 'GET',
  })

  const ids = (result.data?.results || []).map((subscriber) => subscriber.id)

  if (ids.length === 0) {
    return false
  }

  await listmonkAdminFetch('/api/subscribers/lists', {
    method: 'PUT',
    body: JSON.stringify({
      ids,
      action: 'unsubscribe',
      target_list_ids: [listId],
    }),
  })

  return true
}
