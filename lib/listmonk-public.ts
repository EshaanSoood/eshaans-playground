export const LISTMONK_BASE_URL = 'https://lists.eshaansood.org'
export const LISTMONK_PUBLIC_SUBSCRIPTION_URL = `${LISTMONK_BASE_URL}/api/public/subscription`
export const BLOG_NEWSLETTER_LIST_UUID = '16b78e1b-df6e-452e-929a-a1ad9d2ec2c5'

export interface PublicSubscriptionInput {
  email: string
  firstName?: string
  lastName?: string
  name?: string
}

export function buildSubscriberName(input: PublicSubscriptionInput): string | undefined {
  const explicitName = input.name?.trim()
  if (explicitName) {
    return explicitName
  }

  const parts = [input.firstName?.trim(), input.lastName?.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : undefined
}

export function buildPublicSubscriptionPayload(input: PublicSubscriptionInput) {
  return {
    email: input.email.trim(),
    name: buildSubscriberName(input),
    list_uuids: [BLOG_NEWSLETTER_LIST_UUID],
  }
}
