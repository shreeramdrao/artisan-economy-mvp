'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { buyerApi } from '@/lib/api'
import { useCart } from '@/context/cart-context'
import CaptionGenerator from '@/components/CaptionGenerator'

type Props = {
  productId: string
}

export default function ProductPageClient({ productId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'kn'>('en')
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fallbackImg = '/placeholder.png'

  useEffect(() => {
    async function fetchProduct() {
      try {
        const productData = await buyerApi.getProduct(productId)
        setProduct(productData)

        setSelectedImage(
          productData.images?.polished ||
          productData.images?.original ||
          fallbackImg
        )

        const relatedRes = await buyerApi.getProducts({ category: productData.category })
        setRelatedProducts(
          relatedRes.filter((p: any) => p.productId !== productData.productId)
        )
      } catch (err) {
        console.error('❌ Failed to load product:', err)
      }
    }
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  // ✅ Setup audio events
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      const updateProgress = () => {
        if (audio.duration > 0) {
          setProgress((audio.currentTime / audio.duration) * 100)
        }
      }
      const resetOnEnd = () => {
        setIsPlaying(false)
        setProgress(0)
      }
      audio.addEventListener('timeupdate', updateProgress)
      audio.addEventListener('ended', resetOnEnd)
      return () => {
        audio.removeEventListener('timeupdate', updateProgress)
        audio.removeEventListener('ended', resetOnEnd)
      }
    }
  }, [audioRef.current])

  const handlePlayAudio = () => {
    if (!product?.audioUrls?.[selectedLanguage]) {
      toast({
        title: 'No Audio Available',
        description: 'This artisan story has no audio in the selected language',
        variant: 'destructive',
      })
      return
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(product.audioUrls[selectedLanguage])
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      if (audioRef.current.src !== product.audioUrls[selectedLanguage]) {
        audioRef.current.pause()
        audioRef.current = new Audio(product.audioUrls[selectedLanguage])
      }
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleLanguageChange = (lang: 'en' | 'hi' | 'kn') => {
    setSelectedLanguage(lang)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = new Audio(product?.audioUrls?.[lang] || '')
      setIsPlaying(false)
      setProgress(0)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    try {
      setAdding(true)
      await addToCart(product.productId, 1)
      toast({
        title: '✅ Added to Cart',
        description: `${product.title} has been added to your cart`,
      })
    } catch (err) {
      console.error('❌ Failed to add to cart:', err)
      toast({
        title: 'Error',
        description: 'Could not add product to cart',
        variant: 'destructive',
      })
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = () => {
    if (!product) return
    setBuying(true)
    router.push(`/buyer/checkout?productId=${product.productId}&quantity=1`)
  }

  if (!product) return <p className="p-8 text-center">Loading product...</p>

  const thumbnails = [
    { src: product.images?.original || fallbackImg, label: 'Original' },
    { src: product.images?.polished || fallbackImg, label: 'Polished' },
  ]

  const productUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/buyer/product/${product.productId}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={selectedImage || fallbackImg}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {thumbnails.map((thumb) => (
              <img
                key={thumb.label}
                src={thumb.src}
                alt={thumb.label}
                onClick={() => setSelectedImage(thumb.src)}
                className={`w-full aspect-square object-cover rounded cursor-pointer transition ${
                  selectedImage === thumb.src ? 'ring-2 ring-amber-500' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>{product.sellerInfo?.name}</span>
            <span>•</span>
            <span>{product.sellerInfo?.location || 'India'}</span>
          </div>

          <div className="text-3xl font-bold text-amber-600">
            {formatPrice(product.price)}
          </div>

          {/* ✅ Story + Audio */}
          <Card className="p-6 bg-amber-50">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Artisan's Story</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) =>
                    handleLanguageChange(e.target.value as 'en' | 'hi' | 'kn')
                  }
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="kn">ಕನ್ನಡ</option>
                </select>
                <Button size="sm" variant="outline" onClick={handlePlayAudio}>
                  {isPlaying ? '⏸️ Pause' : '▶️ Listen'}
                </Button>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              {product.story?.polished?.[selectedLanguage] ||
                product.story?.original ||
                'No story available'}
            </p>

            {product.audioUrls?.[selectedLanguage] && (
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-amber-500 h-2 rounded"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </Card>

          {/* ---------------- Caption Generator ---------------- */}
          <div className="mt-4">
            <CaptionGenerator
              title={product.title}
              description={
                product.story?.polished?.[selectedLanguage] ||
                product.description ||
                ''
              }
              imageUrl={selectedImage || product.images?.polished || fallbackImg}
              productUrl={productUrl}
            />
          </div>

          <div className="flex space-x-4">
            <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={buying}>
              {buying ? 'Redirecting...' : 'Buy Now'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <Link key={item.productId} href={`/buyer/product/${item.productId}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={item.imageUrl || fallbackImg}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                    <div className="text-lg font-bold text-amber-600">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}