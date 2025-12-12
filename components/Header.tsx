import Link from 'next/link'
import { MAIN_SITE_URL } from '@/lib/links'

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <nav aria-label="Main navigation" className="px-4 py-4">
        <ul className="flex gap-6">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/posts">All Posts</Link>
          </li>
          <li>
            <a href={MAIN_SITE_URL}>Back to Main Site</a>
          </li>
        </ul>
      </nav>
    </header>
  )
}

