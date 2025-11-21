import Link from 'next/link'
import { Post } from '@/lib/content'
import { getProjectConfig } from '@/lib/projects'

interface PostCardProps {
  post: Post
}

const colorClasses: Record<string, { border: string; bg: string; text: string }> = {
  'project-blue': {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-500',
  },
  'project-emerald': {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-500',
  },
  'project-violet': {
    border: 'border-violet-500',
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-500',
  },
  'project-amber': {
    border: 'border-amber-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-500',
  },
  'project-rose': {
    border: 'border-rose-500',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-500',
  },
  'project-cyan': {
    border: 'border-cyan-500',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-500',
  },
}

export function PostCard({ post }: PostCardProps) {
  const projectConfig = post.projectId ? getProjectConfig(post.projectId) : null
  const colorKey = projectConfig?.color || 'project-blue'
  const colors = colorClasses[colorKey] || colorClasses['project-blue']

  return (
    <Link
      href={`/${post.slug}`}
      className="block group"
    >
      <article
        className={`border-l-4 ${colors.border} bg-white dark:bg-gray-900 p-6 rounded-r-lg shadow-sm hover:shadow-md transition-shadow`}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {post.title}
          </h2>
          {post.projectId && projectConfig && (
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text} whitespace-nowrap`}
            >
              {projectConfig.name}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
          {post.summary}
        </p>
      </article>
    </Link>
  )
}

