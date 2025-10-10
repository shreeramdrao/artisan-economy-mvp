import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'   // ✅ import wrapper

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

// ✅ Simplified SEO metadata
export const metadata = {
  title: 'Artisan Economy | Empowering Indian Artisans',
  description: 'AI-powered marketplace for handcrafted Indian goods',
  openGraph: {
    title: 'Artisan Economy',
    description: 'Discover authentic Indian craftsmanship',
    url: 'https://buyerartisaneconomy.in',
    siteName: 'Artisan Economy',
  },
}

// ✅ Structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Artisan Economy",
  "description": "AI-powered marketplace connecting traditional Indian artisans with modern buyers",
  "url": process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://artisan-economy.com',
  "logo": `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://artisan-economy.com'}/images/logo.png`,
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-XXXX-XXXX-XX",
    "contactType": "customer service",
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi", "Kannada"]
  },
  "sameAs": [
    "https://www.facebook.com/artisaneconomy",
    "https://www.instagram.com/artisaneconomy",
    "https://www.twitter.com/artisaneconomy"
  ],
  "foundingDate": "2024",
  "founders": [
    {
      "@type": "Person",
      "name": "Artisan Economy Team"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN",
    "addressRegion": "India"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* ✅ Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        {/* ✅ Font preload */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* ✅ Preconnect to external domains */}
        <link rel="preconnect" href="https://storage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* ✅ DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//storage.googleapis.com" />
        <link rel="dns-prefetch" href="//lh3.googleusercontent.com" />
        
        {/* ✅ Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* ✅ Theme color */}
        <meta name="theme-color" content="#FF6B35" />
        <meta name="msapplication-TileColor" content="#FF6B35" />
        
        {/* ✅ Viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}