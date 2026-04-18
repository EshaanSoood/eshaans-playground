import path from 'path'
import { fileURLToPath } from 'url'
import createMDX from '@next/mdx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Removed output: 'export' to allow server-side rendering on Vercel
  // Vercel supports SSR and will optimize automatically
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
}

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      'rehype-highlight',
      'rehype-slug',
      [
        'rehype-autolink-headings',
        {
          behavior: 'wrap',
          properties: {
            className: ['anchor'],
          },
        },
      ],
    ],
  },
})

export default withMDX(nextConfig)
