interface IframeEmbedProps {
  src: string
  title: string
  caption?: string
  height?: number
}

export function IframeEmbed({
  src,
  title,
  caption,
  height = 520,
}: IframeEmbedProps) {
  return (
    <figure className="my-10 rounded-[1.75rem] border border-border-light bg-white/70 p-4 shadow-paper sm:p-6">
      <iframe
        src={src}
        title={title}
        className="w-full rounded-[1.25rem] border border-border-light/80 bg-white"
        style={{ height }}
      />
      {caption ? (
        <figcaption className="px-1 pt-4 text-sm leading-7 text-text-light">
          <span className="font-medium text-text-secondary">{title}</span> {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
