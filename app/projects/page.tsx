import Link from 'next/link'
import { groupPostsByProject } from '@/lib/content'
import { getProjectConfig } from '@/lib/projects'

const colorClasses: Record<string, string> = {
  'project-blue': 'bg-blue-500',
  'project-emerald': 'bg-emerald-500',
  'project-violet': 'bg-violet-500',
  'project-amber': 'bg-amber-500',
  'project-rose': 'bg-rose-500',
  'project-cyan': 'bg-cyan-500',
}

export default function ProjectsPage() {
  const groupedPosts = groupPostsByProject()

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Projects
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Posts grouped by project
        </p>
      </div>

      {Object.keys(groupedPosts).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groupedPosts).map(([projectId, posts]) => {
            const projectConfig = getProjectConfig(projectId)
            if (!projectConfig) return null

            const colorKey = projectConfig.color || 'project-blue'
            const bgColor = colorClasses[colorKey] || colorClasses['project-blue']

            return (
              <section key={projectId} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 ${bgColor} rounded`} />
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {projectConfig.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {projectConfig.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 ml-4">
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/${post.slug}`}
                        className="group flex items-start gap-3 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      >
                        <span className="text-sm text-gray-500 dark:text-gray-500 mt-1 min-w-[80px]">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                          {post.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No projects yet. Check back soon!
        </p>
      )}
    </div>
  )
}

