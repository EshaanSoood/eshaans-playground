import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-paper sm:p-10">
      <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">404</p>
      <h1 className="mb-3">This page wandered off.</h1>
      <p className="max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
        The route exists in the blog shell, but the page you asked for doesn&apos;t. Head back to
        the writing archive or return to the main site.
      </p>
      <div className="flex flex-wrap gap-3 pt-4">
        <Link
          href="/posts"
          className="inline-flex items-center rounded-full border border-orange-main bg-orange-main px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white no-underline transition hover:bg-orange-deep"
        >
          Browse posts
        </Link>
        <a
          href="https://eshaansood.in"
          className="inline-flex items-center rounded-full border border-blue-deep/15 bg-white/80 px-5 py-3 text-sm font-medium text-text-secondary no-underline transition hover:border-blue-deep/30 hover:text-text-main"
        >
          Main site
        </a>
      </div>
    </section>
  )
}
