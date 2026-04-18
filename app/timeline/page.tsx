import Link from 'next/link'

export default function TimelinePage() {
  return (
    <section className="grid gap-6 rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-paper sm:p-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">Timeline</p>
        <h1 className="mb-3">The chronology is still being consolidated.</h1>
        <p className="max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
          This route used to look abandoned. For now, treat the archive as the real timeline and
          the main site as the polished front door while the longer-form chronology gets rebuilt.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <Link
            href="/posts"
            className="inline-flex items-center rounded-full border border-orange-main bg-orange-main px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white no-underline transition hover:bg-orange-deep"
          >
            View archive timeline
          </Link>
          <a
            href="https://eshaansood.in/about-me.html"
            className="inline-flex items-center rounded-full border border-blue-deep/15 bg-white/80 px-5 py-3 text-sm font-medium text-text-secondary no-underline transition hover:border-blue-deep/30 hover:text-text-main"
          >
            Main site about page
          </a>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-orange-main/12 bg-orange-soft/25 p-6 shadow-paper">
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">Why this exists</p>
        <p className="m-0 text-base leading-8 text-text-secondary">
          Keeping this route styled and explicit is better than leaving an empty stub in the
          navigation. It now behaves like a bridge page instead of a broken one.
        </p>
      </div>
    </section>
  )
}
