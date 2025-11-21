import { MDXRemote } from 'next-mdx-remote/rsc'
import { components } from './MDXComponents'

interface MDXContentProps {
  content: string
}

export function MDXContent({ content }: MDXContentProps) {
  return <MDXRemote source={content} components={components} />
}

