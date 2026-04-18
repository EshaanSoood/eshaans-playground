import Link from 'next/link'
import { MAIN_SITE_LINKS, MAIN_SITE_URL, SOCIAL_LINKS } from '@/lib/links'

export function Footer() {
  return (
    <footer className="border-t border-border-light/80 pb-12 pt-4">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Footer"
          className="rounded-[2rem] border border-white/60 bg-white/60 px-6 py-8 shadow-paper sm:px-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_0.9fr]">
            <div className="flex flex-col gap-4">
              <a
                href={MAIN_SITE_URL}
                className="font-display text-3xl leading-none text-text-main no-underline transition hover:text-orange-main"
              >
                eshaan sood
              </a>
              <p className="m-0 max-w-xl text-base leading-8 text-text-secondary">
                The blog now borrows the main site&apos;s palette and pace, but it remains the
                messier room: drafts, notes, and things that are still becoming themselves.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/posts"
                  className="inline-flex items-center rounded-full border border-blue-deep/15 bg-white/80 px-4 py-2 text-sm font-medium text-text-secondary no-underline transition hover:border-blue-deep/30 hover:text-text-main"
                >
                  Browse archive
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full border border-orange-main bg-orange-main px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-orange-deep"
                >
                  Latest writing
                </Link>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <h2 className="mb-3 text-lg text-text-main">Main site</h2>
                <ul className="flex flex-col gap-2 text-sm text-text-secondary">
                  {MAIN_SITE_LINKS.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="no-underline transition hover:text-text-main">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="mb-3 text-lg text-text-main">Blog</h2>
                <ul className="flex flex-col gap-2 text-sm text-text-secondary">
                  <li>
                    <Link href="/" className="no-underline transition hover:text-text-main">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/posts" className="no-underline transition hover:text-text-main">
                      All Posts
                    </Link>
                  </li>
                  <li>
                    <Link href="/projects" className="no-underline transition hover:text-text-main">
                      Project Index
                    </Link>
                  </li>
                  <li>
                    <Link href="/timeline" className="no-underline transition hover:text-text-main">
                      Timeline
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h2 className="mb-3 text-lg text-text-main">Elsewhere</h2>
                <ul className="flex flex-col gap-2 text-sm text-text-secondary">
                  {SOCIAL_LINKS.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline transition hover:text-text-main"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="m-0 text-sm leading-7 text-text-light">
                Newsletter signups now flow through Listmonk, while published posts are served from
                the new Payload CMS.
              </p>
            </div>
          </div>
        </nav>
      </div>
    </footer>
  )
}
