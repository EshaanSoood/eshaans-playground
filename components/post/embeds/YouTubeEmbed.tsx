interface YouTubeEmbedProps {
  id: string
  title: string
  caption?: string
  start?: number
}

export function YouTubeEmbed({ id, title, caption, start }: YouTubeEmbedProps) {
  const url = new URL(`https://www.youtube.com/embed/${id}`)

  if (start) {
    url.searchParams.set('start', String(start))
  }

  return (
    <figure className="my-10 rounded-[1.75rem] border border-border-light bg-white/70 p-4 shadow-paper sm:p-6">
      <div className="aspect-video overflow-hidden rounded-[1.25rem] border border-border-light/80 bg-blue-soft/20">
        <iframe
          src={url.toString()}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {(title || caption) ? (
        <figcaption className="px-1 pt-4 text-sm leading-7 text-text-light">
          <span className="font-medium text-text-secondary">{title}</span>
          {caption ? ` ${caption}` : ''}
        </figcaption>
      ) : null}
    </figure>
  )
}
