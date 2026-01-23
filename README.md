# Blog

A personal blog built with Next.js, deployed on Vercel.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Content**: MDX with Convex backend
- **Deployment**: Vercel
- **Database**: Convex

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Convex account (for content management)

### Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd blog
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
CONVEX_URL=your_convex_url_here
PUBLIC_MAIN_SITE_URL=https://eshaansood.in
```

4. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Building

Build the site for production:
```bash
npm run build
```

Start the production server locally:
```bash
npm start
```

The built site will be in the `.next/` directory.

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Vercel will auto-detect Next.js and configure build settings
3. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL
   - `CONVEX_URL`: Your Convex deployment URL (for server-side)
   - `PUBLIC_MAIN_SITE_URL`: Your main site URL (optional)

### Custom Domain

1. Add custom domain in Vercel dashboard
2. Update DNS records as instructed
3. SSL/TLS will be automatically provisioned

## Project Structure

```
/
├── app/                # Next.js App Router pages
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   └── posts/          # Post pages
├── components/         # React components
├── lib/                # Utilities and helpers
├── public/             # Static assets
├── convex/             # Convex functions
└── styles/             # Global styles
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run Next.js linting

## Content Management

Posts are managed through Convex. The site queries Convex at build time to generate static pages.

## License

Private project.
