import Image from 'next/image'

interface GalleryImage {
  src: string
  alt: string
  caption?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  title?: string
  columns?: 2 | 3
}

export function ImageGallery({ images, title, columns = 2 }: ImageGalleryProps) {
  const gridClass =
    columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'

  return (
    <section className="my-10 rounded-[1.75rem] border border-border-light bg-white/60 p-4 shadow-paper sm:p-6">
      {title ? <h2 className="mb-4 text-2xl">{title}</h2> : null}
      <div className={`grid gap-4 ${gridClass}`}>
        {images.map((image) => (
          <figure
            key={`${image.src}-${image.alt}`}
            className="overflow-hidden rounded-[1.5rem] border border-border-light/80 bg-bg-card/80 p-3"
          >
            <div className="overflow-hidden rounded-[1rem]">
              <Image
                src={image.src}
                alt={image.alt}
                width={1400}
                height={1000}
                className="m-0 h-auto w-full rounded-[1rem] object-cover"
              />
            </div>
            {image.caption ? (
              <figcaption className="px-1 pt-3 text-sm leading-7 text-text-light">
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  )
}
