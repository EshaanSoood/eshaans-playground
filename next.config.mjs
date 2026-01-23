import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Removed output: 'export' to allow server-side rendering on Vercel
  // Vercel supports SSR and will optimize automatically
  images: {
    unoptimized: true,
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

