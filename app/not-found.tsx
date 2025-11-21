import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
        404 - Page Not Found
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        Return home
      </Link>
    </div>
  )
}

