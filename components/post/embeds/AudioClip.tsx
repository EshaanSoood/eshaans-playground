interface AudioClipProps {
  src: string
  title: string
  caption?: string
  poster?: string
}

export function AudioClip({ src, title, caption, poster }: AudioClipProps) {
  return (
    <figure className="my-10 rounded-[1.75rem] border border-border-light bg-white/70 p-5 shadow-paper sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-orange-main/15 bg-orange-soft/35 px-3 py-1 text-xs uppercase tracking-[0.18em] text-orange-deep">
          Audio
        </span>
        <h2 className="mb-0 text-2xl">{title}</h2>
      </div>

      {poster ? (
        <img
          src={poster}
          alt=""
          className="mb-4 mt-0 h-auto w-full rounded-[1.25rem] border border-border-light/80 object-cover"
        />
      ) : null}

      <audio
        controls
        preload="metadata"
        className="w-full"
        aria-label={title}
      >
        <source src={src} />
        Your browser does not support the audio element.
      </audio>

      {caption ? (
        <figcaption className="pt-4 text-sm leading-7 text-text-light">{caption}</figcaption>
      ) : null}
    </figure>
  )
}
