export const MAIN_SITE_URL =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://eshaansood.in'

function joinMainSitePath(path: string) {
  return new URL(path, MAIN_SITE_URL.endsWith('/') ? MAIN_SITE_URL : `${MAIN_SITE_URL}/`).toString()
}

export const MAIN_SITE_LINKS = [
  { label: 'About', href: joinMainSitePath('/about-me.html') },
  { label: 'Projects', href: joinMainSitePath('/projects.html') },
  { label: 'Collaborate', href: joinMainSitePath('/collaborate.html') },
  { label: 'Lessons', href: joinMainSitePath('/lessons.html') },
  { label: 'Contact', href: joinMainSitePath('/contact.html') },
] as const

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/thejumpymonkey/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@EshaanSoood' },
] as const
