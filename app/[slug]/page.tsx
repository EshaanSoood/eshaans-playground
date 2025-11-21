import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPosts } from '@/lib/content'
import { getProjectConfig } from '@/lib/projects'
import { CopyLinkButton } from '@/components/CopyLinkButton'
import { MDXContent } from '@/components/MDXContent'

interface PostPageProps {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

const colorClasses: Record<string, { bg: string; text: string }> = {
  'project-blue': {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-500',
  },
  'project-emerald': {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-500',
  },
  'project-violet': {
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-500',
  },
  'project-amber': {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-500',
  },
  'project-rose': {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-500',
  },
  'project-cyan': {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-500',
  },
}

export default function PostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const projectConfig = post.projectId ? getProjectConfig(post.projectId) : null
  const colorKey = projectConfig?.color || 'project-blue'
  const colors = colorClasses[colorKey] || colorClasses['project-blue']

  const shareUrl = `https://blog.eshaansood.in/${post.slug}`

  return (
    <article className="space-y-8">
      {/* Meta Section */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>•</span>
          <span>{post.readingTime.text}</span>
          {post.tags && post.tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        {post.projectId && projectConfig && (
          <div>
            <span
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${colors.bg} ${colors.text}`}
            >
              {projectConfig.name}
            </span>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="max-w-none">
        <MDXContent content={post.content} />
      </div>

      {/* Post Footer */}
      <footer className="pt-8 mt-12 border-t border-gray-200 dark:border-gray-800 space-y-6">
        {/* Author Bio */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            About the Author
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Eshaan Sood is a web developer and accessibility consultant passionate about
            creating thoughtful, accessible web experiences.
          </p>
        </div>

        {/* Repo and Demo Links */}
        {(post.projectRepoUrl || post.liveDemoUrl) && (
          <div className="flex flex-wrap gap-4">
            {post.projectRepoUrl && (
              <a
                href={post.projectRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                View Repository
              </a>
            )}
            {post.liveDemoUrl && (
              <a
                href={post.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Live Demo
              </a>
            )}
          </div>
        )}

        {/* Share Buttons */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Share this post
          </h3>
          <div className="flex flex-wrap gap-3">
            <ShareButton
              type="facebook"
              url={shareUrl}
              title={post.title}
            />
            <ShareButton
              type="linkedin"
              url={shareUrl}
              title={post.title}
            />
            <CopyLinkButton url={shareUrl} />
          </div>
        </div>

        {/* Back to Timeline */}
        <div>
          <Link
            href="/timeline"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            ← Back to timeline
          </Link>
        </div>
      </footer>
    </article>
  )
}

function ShareButton({
  type,
  url,
  title,
}: {
  type: 'facebook' | 'linkedin'
  url: string
  title: string
}) {
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  }

  return (
    <a
      href={shareUrls[type]}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
    >
      {type === 'facebook' ? (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Share on Facebook
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Share on LinkedIn
        </>
      )}
    </a>
  )
}


