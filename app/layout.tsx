import { Inter, Merriweather } from 'next/font/google'
import '../styles/globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['300', '400', '700', '900'],
  display: 'swap',
})

export const metadata = {
  title: "Eshaan's Playground.",
  description: 'Cards pulled out at random. A place where all my interests converge.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body>
        <Header />
        <main className="px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

