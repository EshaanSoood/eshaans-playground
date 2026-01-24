'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [isUnsubscribing, setIsUnsubscribing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleUnsubscribe = async () => {
    if (!email) {
      setErrorMessage('Email address is missing')
      setStatus('error')
      return
    }

    setIsUnsubscribing(true)
    setStatus('idle')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/subscribers/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unsubscribe')
      }

      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setIsUnsubscribing(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1
        style={{
          color: 'var(--text-main)',
        }}
      >
        I'll miss you friend.
      </h1>

      {status === 'success' ? (
        <div
          className="rounded px-4 py-3 text-center"
          style={{
            backgroundColor: 'var(--bg-soft)',
            color: 'var(--text-secondary)',
          }}
        >
          <p>You've been unsubscribed successfully.</p>
        </div>
      ) : status === 'error' ? (
        <div
          className="rounded px-4 py-3 text-center"
          style={{
            backgroundColor: 'var(--orange-soft)',
            color: 'var(--orange-deep)',
          }}
        >
          <p>{errorMessage || 'Something went wrong. Please try again.'}</p>
        </div>
      ) : (
        <button
          onClick={handleUnsubscribe}
          disabled={isUnsubscribing || !email}
          className="rounded px-6 py-3 font-medium transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#FFFFFF',
          }}
        >
          {isUnsubscribing ? 'Unsubscribing...' : 'Get Out Of My Inbox'}
        </button>
      )}

      {!email && (
        <p
          className="text-sm text-center"
          style={{
            color: 'var(--text-light)',
          }}
        >
          No email address provided. Please use the unsubscribe link from your email.
        </p>
      )}
    </main>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <h1
            style={{
              color: 'var(--text-main)',
            }}
          >
            I'll miss you friend.
          </h1>
          <p
            className="text-sm"
            style={{
              color: 'var(--text-light)',
            }}
          >
            Loading...
          </p>
        </main>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  )
}
