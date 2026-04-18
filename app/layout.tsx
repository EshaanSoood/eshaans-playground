import { Cormorant_Garamond, Manrope } from 'next/font/google'
import '../styles/globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BLOG_URL || 'https://blog.eshaansood.in'),
  title: "Eshaan's Playground.",
  description: 'Cards pulled out at random. A place where all my interests converge.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${cormorant.variable}`}>
      <body className="bg-bg-main text-text-main antialiased">
        <div
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top,rgba(94,133,171,0.22),transparent_52%),radial-gradient(circle_at_18%_14%,rgba(179,64,54,0.16),transparent_36%),linear-gradient(180deg,rgba(255,248,241,0.8),rgba(255,235,219,0))]"
          aria-hidden="true"
        />
        <Header />
        <main className="pb-20 pt-8 sm:pt-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  )
}
