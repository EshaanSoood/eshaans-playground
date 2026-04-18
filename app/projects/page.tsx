import Link from 'next/link'
import { MAIN_SITE_LINKS } from '@/lib/links'

export default function ProjectsPage() {
  const projectsHref = MAIN_SITE_LINKS.find((link) => link.label === 'Projects')?.href

  return (
    <section className="grid gap-6 rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-paper sm:p-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">Projects</p>
        <h1 className="mb-3">The full project index still lives on the main site.</h1>
        <p className="max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
          This blog now matches the main site visually, but the structured project pages haven&apos;t
          been migrated here yet. Use the main site for the canonical project grid and come back
          here for the writing attached to it.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          {projectsHref ? (
            <a
              href={projectsHref}
              className="inline-flex items-center rounded-full border border-orange-main bg-orange-main px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white no-underline transition hover:bg-orange-deep"
            >
              Open main site projects
            </a>
          ) : null}
          <Link
            href="/posts"
            className="inline-flex items-center rounded-full border border-blue-deep/15 bg-white/80 px-5 py-3 text-sm font-medium text-text-secondary no-underline transition hover:border-blue-deep/30 hover:text-text-main"
          >
            Browse project writing
          </Link>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-blue-deep/12 bg-blue-soft/18 p-6 shadow-paper">
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-text-light">Current state</p>
        <p className="m-0 text-base leading-8 text-text-secondary">
          Project taxonomy inside the blog is still thin. This page is now at least intentional
          instead of appearing broken while the CMS content model catches up.
        </p>
      </div>
    </section>
  )
}
