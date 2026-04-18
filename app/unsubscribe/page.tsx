'use client'

import { Suspense, useState } from 'react'
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
    <main className="flex min-h-[60vh] items-center justify-center">
      <section className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white/65 p-8 text-center shadow-paper sm:p-10">
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">Newsletter</p>
        <h1>I&apos;ll miss you friend.</h1>
        <p className="mx-auto max-w-xl text-base leading-8 text-text-secondary sm:text-lg">
          If the newsletter isn&apos;t serving you anymore, use the button below and I&apos;ll stop
          sending it.
        </p>

        <div className="mt-8 flex flex-col items-center gap-5">
          {status === 'success' ? (
            <div className="w-full rounded-[1.5rem] border border-blue-deep/15 bg-blue-soft/20 px-5 py-4 text-center text-text-secondary">
              <p className="m-0">You&apos;ve been unsubscribed successfully.</p>
            </div>
          ) : status === 'error' ? (
            <div className="w-full rounded-[1.5rem] border border-orange-main/20 bg-orange-soft/30 px-5 py-4 text-center text-orange-deep">
              <p className="m-0">{errorMessage || 'Something went wrong. Please try again.'}</p>
            </div>
          ) : (
            <button
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing || !email}
              className="inline-flex items-center justify-center rounded-full border border-orange-main bg-orange-main px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-orange-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUnsubscribing ? 'Unsubscribing...' : 'Get Out Of My Inbox'}
            </button>
          )}

          {!email ? (
            <p className="max-w-lg text-sm leading-7 text-text-light">
              No email address was provided. Use the unsubscribe link from a newsletter email so the
              app knows which address to remove.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center">
          <section className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white/65 p-8 text-center shadow-paper sm:p-10">
            <h1>I&apos;ll miss you friend.</h1>
            <p className="text-sm text-text-light">Loading...</p>
          </section>
        </main>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  )
}
