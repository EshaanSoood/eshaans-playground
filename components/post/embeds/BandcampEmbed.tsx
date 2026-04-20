interface BandcampEmbedProps {
  itemId: string
  type?: 'track' | 'album'
  size?: 'large' | 'compact'
  title?: string
  caption?: string
}

export function BandcampEmbed({
  itemId,
  type = 'track',
  size = 'large',
  title,
  caption,
}: BandcampEmbedProps) {
  const isAlbum = type === 'album'
  const embedType = isAlbum ? 'album' : 'track'
  const artwork = size === 'large' ? 'large' : 'small'
  const height = size === 'large' ? 472 : 120
  const src = `https://bandcamp.com/EmbeddedPlayer/${embedType}=${itemId}/size=${artwork}/bgcol=ffffff/linkcol=234371/artwork=${artwork === 'large' ? 'small' : 'none'}/transparent=true/`

  return (
    <figure className="my-10 rounded-[1.75rem] border border-border-light bg-white/70 p-4 shadow-paper sm:p-6">
      <iframe
        title={title || `${type} bandcamp embed`}
        className="w-full rounded-[1.25rem] border border-border-light/80 bg-white"
        style={{ height }}
        src={src}
        seamless
      />
      {(title || caption) ? (
        <figcaption className="px-1 pt-4 text-sm leading-7 text-text-light">
          {title ? <span className="font-medium text-text-secondary">{title}</span> : null}
          {title && caption ? ' ' : ''}
          {caption || ''}
        </figcaption>
      ) : null}
    </figure>
  )
}
