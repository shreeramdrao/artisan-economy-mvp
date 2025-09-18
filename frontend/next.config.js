/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['storage.googleapis.com', 'localhost'],
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000',
    NEXT_PUBLIC_GOOGLE_PROJECT_ID: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID || 'artisan-ai-hackathon',
  },
}

module.exports = nextConfig