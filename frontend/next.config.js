/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Enable standalone output for Docker / Cloud Run
  output: 'standalone',

  // ✅ Experimental flags compatible with Next.js 14.1+
  experimental: {
    typedRoutes: true,
    optimizeCss: false,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  // ✅ Image optimization (remote patterns + security)
  images: {
    domains: ['via.placeholder.com', 'res.cloudinary.com', 'images.unsplash.com', 'localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'artisan-frontend-188692597311.asia-south1.run.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'artisan-backend-in6bgnvyxa-el.a.run.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ Performance and build optimizations
  compress: true,
  poweredByHeader: false,

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
  },

  // ✅ Environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
  },

  // ✅ Security headers with environment-based CSP
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    
    // Log CSP mode
    if (isDev) {
      console.log('⚠️ Running in DEV mode: CSP disabled for development');
    } else {
      console.log('🔒 Running in PRODUCTION mode: strict CSP enforced');
    }

    // In development mode, disable CSP entirely to avoid blocking issues
    if (isDev) {
      return [
        {
          source: '/(.*)',
          headers: [
            // Only keep essential security headers in development
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          ],
        },
        {
          source: '/images/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/_next/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ];
    }

    // Production CSP - strict security with required domains
    const cspPolicy = 
      "default-src 'self' data: blob: https://fonts.googleapis.com https://fonts.gstatic.com; " +
      "script-src 'self'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: blob: https://via.placeholder.com https://images.unsplash.com https://res.cloudinary.com https://lh3.googleusercontent.com https://storage.googleapis.com; " +
      "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; " +
      "connect-src 'self' https: wss:; " +
      "frame-src 'none'; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';";

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspPolicy },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ✅ SEO Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // ✅ Prevent dev caching issues (ensures BuyerLayout reloads)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;