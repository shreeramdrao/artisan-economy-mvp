import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

console.log('🟢 RootLayout loaded')

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://buyerartisaneconomy.in'),
  title: {
    default: 'Artisan Economy | Empowering Indian Artisans',
    template: '%s | Artisan Economy',
  },
  description:
    'AI-powered marketplace for handcrafted Indian goods. Support local artisans and discover authentic craftsmanship.',
  keywords: ['artisan', 'handcrafted', 'Indian crafts', 'marketplace', 'traditional', 'authentic'],
  authors: [{ name: 'Artisan Economy Team' }],
  creator: 'Artisan Economy',
  publisher: 'Artisan Economy',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Artisan Economy',
    title: 'Artisan Economy | Empowering Indian Artisans',
    description:
      'AI-powered marketplace for handcrafted Indian goods. Support local artisans and discover authentic craftsmanship.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Artisan Economy - Handcrafted Indian Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artisan Economy | Empowering Indian Artisans',
    description:
      'AI-powered marketplace for handcrafted Indian goods. Support local artisans and discover authentic craftsmanship.',
    images: ['/images/og-image.png'],
    creator: '@artisaneconomy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Artisan Economy',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  themeColor: '#667eea',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Artisan Economy',
  description:
    'AI-powered marketplace connecting traditional Indian artisans with modern buyers',
  url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://artisan-economy.com',
  logo: `${
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://artisan-economy.com'
  }/images/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-XXXX-XXXX-XX',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi', 'Kannada'],
  },
  sameAs: [
    'https://www.facebook.com/artisaneconomy',
    'https://www.instagram.com/artisaneconomy',
    'https://www.twitter.com/artisaneconomy',
  ],
  foundingDate: '2024',
  founders: [
    {
      '@type': 'Person',
      name: 'Artisan Economy Team',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
    addressRegion: 'India',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://storage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//storage.googleapis.com" />
        <link rel="dns-prefetch" href="//lh3.googleusercontent.com" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Artisan Economy" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Artisan Economy" />
        
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/images/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/images/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/images/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>

      <body className={`${inter.className} antialiased`}>
        {/* ✅ Move Providers inside body but outside main */}
        <Providers>
          {/* ✅ Ensure the buyer layout can render inside main */}
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}