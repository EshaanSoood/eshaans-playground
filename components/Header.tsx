'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MAIN_SITE_LINKS, MAIN_SITE_URL } from '@/lib/links'
import { SubscribeModal } from './SubscribeModal'

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pathname = usePathname()
  const subscribeButtonRef = useRef<HTMLButtonElement>(null)

  const localLinks = [
    { label: 'Latest', href: '/' },
    { label: 'Archive', href: '/posts' },
    { label: 'Projects', href: '/projects' },
    { label: 'Timeline', href: '/timeline' },
  ]

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)

    requestAnimationFrame(() => {
      subscribeButtonRef.current?.focus()
    })
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border-light/70 bg-bg-main/85 backdrop-blur-xl">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/50 bg-white/55 px-5 py-5 shadow-paper sm:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <a
                  href={MAIN_SITE_URL}
                  className="font-display text-3xl leading-none text-text-main no-underline transition hover:text-orange-main"
                >
                  eshaan sood
                </a>
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-text-light">
                  <span className="rounded-full border border-blue-deep/15 bg-blue-soft/25 px-3 py-1 text-text-secondary">
                    Playground
                  </span>
                  <span>thoughts, process, and unfinished maps</span>
                </div>
              </div>

              <button
                ref={subscribeButtonRef}
                onClick={handleOpenModal}
                aria-label="Subscribe to newsletter"
                aria-haspopup="dialog"
                aria-expanded={isModalOpen}
                aria-controls="subscribe-modal"
                className="inline-flex items-center justify-center rounded-full border border-orange-main bg-orange-main px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white no-underline transition hover:-translate-y-0.5 hover:bg-orange-deep"
              >
                Subscribe
              </button>
            </div>

            <div className="flex flex-col gap-3 border-t border-border-light/70 pt-4">
              <ul className="flex flex-wrap gap-2">
                {localLinks.map((link) => {
                  const isActive = pathname === link.href

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={[
                          'inline-flex items-center rounded-full border px-3.5 py-2 text-sm font-medium no-underline transition',
                          isActive
                            ? 'border-orange-main bg-orange-main text-white'
                            : 'border-blue-deep/15 bg-white/70 text-text-secondary hover:border-blue-deep/30 hover:bg-blue-soft/25 hover:text-text-main',
                        ].join(' ')}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-light">
                {MAIN_SITE_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="no-underline transition hover:text-text-main">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <SubscribeModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  )
}
