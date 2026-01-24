'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MAIN_SITE_URL } from '@/lib/links'
import { SubscribeModal } from './SubscribeModal'

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <header>
        <nav aria-label="Main navigation">
          <ul className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/posts">All Posts</Link>
            </li>
            <li>
              <a href={MAIN_SITE_URL}>Back to Main Site</a>
            </li>
            <li>
              <button
                onClick={() => setIsModalOpen(true)}
                aria-label="Subscribe to newsletter"
                style={{
                  color: 'var(--text-light)',
                  fontSize: '13px',
                  textDecoration: 'none',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-light)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.color = 'var(--text-light)'
                }}
              >
                Subscribe
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <SubscribeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

