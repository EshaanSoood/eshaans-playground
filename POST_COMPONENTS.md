# Post Components

This blog now supports a small approved MDX component library for richer posts.

## Media Home

Put blog-only assets here:

- `public/blog-media/images/`
- `public/blog-media/audio/`

Those files are served from:

- `/blog-media/images/...`
- `/blog-media/audio/...`

## Supported Components

### `BlogImage`

```mdx
<BlogImage
  src="/blog-media/images/album-session-01.jpg"
  alt="Tracking guitars in the studio"
  caption="Day one of tracking."
/>
```

### `ImageGallery`

```mdx
<ImageGallery
  title="Studio Notes"
  images={[
    { src: "/blog-media/images/01.jpg", alt: "Mic stand" },
    { src: "/blog-media/images/02.jpg", alt: "Pedalboard", caption: "The chaos table." }
  ]}
/>
```

### `AudioClip`

```mdx
<AudioClip
  src="/blog-media/audio/demo-fragment.mp3"
  title="Voice memo from the first sketch"
  caption="A rough melodic idea before the arrangement existed."
/>
```

### `YouTubeEmbed`

```mdx
<YouTubeEmbed
  id="dQw4w9WgXcQ"
  title="Launch walkthrough"
  caption="A quick product overview."
/>
```

### `BandcampEmbed`

```mdx
<BandcampEmbed
  type="track"
  itemId="1234567890"
  title="Single draft"
  caption="An early mix I wanted to share in context."
/>
```

### `IframeEmbed`

Use this for safe external embeds or hosted microsurfaces you control.

```mdx
<IframeEmbed
  src="https://demo.example.com"
  title="Interactive prototype"
  height={560}
/>
```

### `ParserPlayground`

This is for interactive demos backed by repo code. Posts do not define the parser logic.

```mdx
<ParserPlayground demo="demo-parser" />
```

To add a real parser demo, register it in `lib/parser-playground-registry.ts`.

## Design Rule

Posts may reference approved components. They should not contain arbitrary application logic.

The content layer stays declarative; the repo owns the code.
