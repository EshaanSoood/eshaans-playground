'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import {
  LISTMONK_PUBLIC_SUBSCRIPTION_URL,
  buildPublicSubscriptionPayload,
} from '@/lib/listmonk-public'

interface SubscribeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const firstNameInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) {
      setFirstName('')
      setLastName('')
      setEmail('')
      setHoneypot('')
      setMessage(null)
      setIsSubmitting(false)
      setTimeout(() => firstNameInputRef.current?.focus(), 100)
    } else if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen, isSubmitting, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [isOpen])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (honeypot.trim()) {
      onClose()
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(LISTMONK_PUBLIC_SUBSCRIPTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildPublicSubscriptionPayload({ firstName, lastName, email })),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to subscribe')
      }

      setMessage({
        type: 'success',
        text: 'Success. Check your email to confirm your subscription.',
      })

      setFirstName('')
      setLastName('')
      setEmail('')
      setHoneypot('')

      closeTimeoutRef.current = setTimeout(() => {
        onClose()
        closeTimeoutRef.current = null
      }, 2000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      id="subscribe-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
      style={{ backgroundColor: 'rgba(21, 39, 66, 0.42)' }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="subscribe-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl rounded-[2rem] border border-white/60 bg-[#fff8f1] p-6 shadow-paper-strong sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-full border border-blue-deep/10 bg-white/80 px-3 py-2 text-lg leading-none text-text-light transition hover:text-text-main focus:outline-none focus:ring-2 focus:ring-blue-deep/20 focus:ring-offset-2"
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="mb-6 flex flex-col gap-3 pr-12">
          <span className="w-fit rounded-full border border-orange-main/20 bg-orange-soft/40 px-3 py-1 text-xs uppercase tracking-[0.22em] text-orange-deep">
            Newsletter
          </span>
          <h2 id="subscribe-modal-title" className="mb-0 text-4xl sm:text-[2.85rem]">
            Stay close to the work.
          </h2>
          <p className="m-0 text-base leading-8 text-text-secondary">
            Sign up for new posts, experiments, and the occasional useful tangent. This list uses
            double opt-in, so you&apos;ll confirm by email before anything starts arriving.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute left-[-9999px] opacity-0"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="text-sm font-medium text-text-secondary">
                First Name <span className="text-orange-main">*</span>
              </label>
              <input
                ref={firstNameInputRef}
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                disabled={isSubmitting}
                className="rounded-2xl border border-border-light bg-white/80 px-4 py-3 text-text-main shadow-sm outline-none transition placeholder:text-text-light/70 focus:border-blue-deep/35 focus:ring-4 focus:ring-blue-deep/10"
                placeholder="Eshaan"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="text-sm font-medium text-text-secondary">
                Last Name <span className="text-orange-main">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                disabled={isSubmitting}
                className="rounded-2xl border border-border-light bg-white/80 px-4 py-3 text-text-main shadow-sm outline-none transition placeholder:text-text-light/70 focus:border-blue-deep/35 focus:ring-4 focus:ring-blue-deep/10"
                placeholder="Sood"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-text-secondary">
              Email <span className="text-orange-main">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isSubmitting}
              className="rounded-2xl border border-border-light bg-white/80 px-4 py-3 text-text-main shadow-sm outline-none transition placeholder:text-text-light/70 focus:border-blue-deep/35 focus:ring-4 focus:ring-blue-deep/10"
              placeholder="you@example.com"
            />
          </div>

          {message ? (
            <div
              role="alert"
              aria-live={message.type === 'error' ? 'assertive' : 'polite'}
              className={[
                'rounded-2xl border px-4 py-3 text-sm',
                message.type === 'success'
                  ? 'border-blue-deep/15 bg-blue-soft/20 text-text-secondary'
                  : 'border-orange-main/20 bg-orange-soft/35 text-orange-deep',
              ].join(' ')}
            >
              {message.text}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-border-light/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 text-sm leading-7 text-text-light">
              Managed through Listmonk. One click to join, one email to confirm.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full border border-orange-main bg-orange-main px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-orange-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
