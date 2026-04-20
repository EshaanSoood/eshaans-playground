import Image from 'next/image'

interface BlogImageProps {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
  priority?: boolean
}

export function BlogImage({
  src,
  alt,
  caption,
  width = 1600,
  height = 900,
  priority = false,
}: BlogImageProps) {
  return (
    <figure className="my-10 overflow-hidden rounded-[1.75rem] border border-border-light bg-white/60 p-3 shadow-paper sm:p-4">
      <div className="overflow-hidden rounded-[1.25rem]">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className="m-0 h-auto w-full rounded-[1.25rem] object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="px-2 pt-4 text-center text-sm leading-7 text-text-light">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
