'use client'

import { useState, FormEvent, useEffect, useRef } from 'react'

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
  const formRef = useRef<HTMLFormElement>(null)
  const firstNameInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFirstName('')
      setLastName('')
      setEmail('')
      setHoneypot('')
      setMessage(null)
      setIsSubmitting(false)
      // Focus first input when modal opens
      setTimeout(() => firstNameInputRef.current?.focus(), 100)
    } else {
      // Clear any pending timeouts when modal closes
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [isOpen])

  // Handle escape key to close modal and trap focus
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    // Focus trap: keep focus within modal
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen, onClose, isSubmitting])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      // Cleanup timeout on unmount
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [isOpen])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/subscribers/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          honeypot: honeypot.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setMessage({
        type: 'success',
        text: data.message || 'Thank you for subscribing!',
      })

      // Reset form on success
      setFirstName('')
      setLastName('')
      setEmail('')
      setHoneypot('')

      // Close modal after 2 seconds on success
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking backdrop (but not when submitting)
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
      style={{
        backgroundColor: 'rgba(31, 42, 51, 0.5)',
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="subscribe-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded border p-6 shadow-lg"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-xl leading-none hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
          aria-label="Close modal"
          style={{
            color: 'var(--text-light)',
            transition: 'opacity 0.2s ease',
          }}
        >
          ×
        </button>

        <h2
          id="subscribe-modal-title"
          className="mb-4 text-2xl"
          style={{
            color: 'var(--text-main)',
          }}
        >
          Subscribe
        </h2>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Honeypot field - invisible to users */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="firstName"
              className="text-sm"
              style={{
                color: 'var(--text-secondary)',
              }}
            >
              First Name <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              ref={firstNameInputRef}
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isSubmitting}
              className="rounded border px-3 py-2"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="lastName"
              className="text-sm"
              style={{
                color: 'var(--text-secondary)',
              }}
            >
              Last Name <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isSubmitting}
              className="rounded border px-3 py-2"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm"
              style={{
                color: 'var(--text-secondary)',
              }}
            >
              Email <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="rounded border px-3 py-2"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          {message && (
            <div
              role="alert"
              aria-live={message.type === 'error' ? 'assertive' : 'polite'}
              className="rounded px-3 py-2 text-sm"
              style={{
                backgroundColor:
                  message.type === 'success'
                    ? 'var(--bg-soft)'
                    : 'var(--orange-soft)',
                color:
                  message.type === 'success'
                    ? 'var(--text-secondary)'
                    : 'var(--orange-deep)',
              }}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded px-4 py-2 font-medium transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
            }}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  )
}
