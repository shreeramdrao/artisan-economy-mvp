import { Metadata } from 'next'
import ProductPageClient from '@/components/ProductPageClient'

type Props = {
  params: { productId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'}/buyer/product/${params.productId}`,
      { cache: 'no-store' }
    )

    if (!res.ok) throw new Error('Product not found')
    const product = await res.json()

    const title = product?.title || 'Artisan Product'
    const description =
      product?.story?.original?.slice(0, 150) ||
      product?.description?.slice(0, 150) ||
      'Handcrafted with love by artisans.'
    const image =
      product?.images?.polished ||
      product?.images?.original ||
      '/placeholder.png'
    const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/buyer/product/${params.productId}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        images: [{ url: image, width: 800, height: 800, alt: title }],
        siteName: 'Artisan Economy',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    }
  } catch (err) {
    console.error('❌ Failed to fetch product for metadata:', err)
    return {
      title: 'Artisan Product',
      description: 'Discover handcrafted artisan goods.',
    }
  }
}

export default function Page({ params }: Props) {
  return (
    <>
      <ProductPageClient productId={params.productId} />
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Artisan Product",
            "description": "Handcrafted with love by artisans.",
            "image": "/placeholder.png",
            "brand": {
              "@type": "Brand",
              "name": "Artisan Economy"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": "Artisan Economy"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.5",
              "reviewCount": "1"
            }
          })
        }}
      />
    </>
  )
}