import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'   // ✅ import wrapper

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Artisan Economy - Empowering Indian Craftsmen',
  description:
    'AI-powered marketplace connecting traditional artisans with modern buyers',
  keywords: 'artisan, craftsmen, handmade, Indian crafts, marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}