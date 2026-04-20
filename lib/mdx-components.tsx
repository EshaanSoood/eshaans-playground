import type { MDXComponents } from 'mdx/types'
import { AudioClip } from '@/components/post/embeds/AudioClip'
import { BandcampEmbed } from '@/components/post/embeds/BandcampEmbed'
import { BlogImage } from '@/components/post/embeds/BlogImage'
import { IframeEmbed } from '@/components/post/embeds/IframeEmbed'
import { ImageGallery } from '@/components/post/embeds/ImageGallery'
import { YouTubeEmbed } from '@/components/post/embeds/YouTubeEmbed'
import { ParserPlayground } from '@/components/post/demos/ParserPlayground'

export const mdxComponents: MDXComponents = {
  BlogImage,
  ImageGallery,
  AudioClip,
  YouTubeEmbed,
  BandcampEmbed,
  IframeEmbed,
  ParserPlayground,
}
