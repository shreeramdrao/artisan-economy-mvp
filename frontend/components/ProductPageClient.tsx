'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { buyerApi } from '@/lib/api'
import { useCart } from '@/context/cart-context'
import AIRecommendations from '@/components/buyer/ai-recommendations'
import ProductZoomModal from '@/components/buyer/product-zoom-modal'
import ChatAssistant from '@/components/buyer/chat-assistant'
import CartSuggestions from '@/components/buyer/cart-suggestions'
import QuickViewModal from '@/components/buyer/quick-view-modal'
import FestivalBanner from '@/components/ui/festival-banner'
import ScrollToTop from '@/components/ui/scroll-to-top'
import { ConfettiProvider } from '@/components/providers/confetti-provider'
import ProductImageSection from '@/components/buyer/product-image-section'
import ProductDescriptionSection from '@/components/buyer/product-description-section'
import ProductActionButtons from '@/components/buyer/product-action-buttons'
import AudioPlayer from '@/components/ui/audio-player'
import ttsService from '@/lib/tts-service'
import RelatedProductsSection from '@/components/buyer/related-products-section'
import ErrorBoundary from '@/components/ui/error-boundary'

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
  const [zoomModalOpen, setZoomModalOpen] = useState(false)
  
  // Auto-rotation state management
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  
  // Text-to-speech state management
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false)
  const [ttsError, setTtsError] = useState<string | null>(null)
  
  // Debounced progress update to prevent excessive re-renders
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoRotationRef = useRef<NodeJS.Timeout | null>(null)
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  
  // Enhanced state management for error handling
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  
  // Debug state for V2 components
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fallbackImg = '/placeholder.png'

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setError('No product ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setNotFound(false)

        console.log('🔍 Fetching product:', productId)
        const productData = await buyerApi.getProduct(productId)
        
        // Validate product data structure
        if (!productData) {
          console.warn('⚠️ Product data is null/undefined for ID:', productId)
          setNotFound(true)
          setLoading(false)
          return
        }

        // Validate required fields
        if (!productData.productId || !productData.title) {
          console.warn('⚠️ Product missing required fields:', productData)
          setNotFound(true)
          setLoading(false)
          return
        }

        console.log('✅ Product loaded successfully:', productData)
        console.log('🔊 Audio URLs:', productData.audioUrls)
        setProduct(productData)

        // Safely set selected image with fallbacks
        const imageUrl = productData.images?.polished ||
                        productData.images?.original ||
                        fallbackImg
        setSelectedImage(imageUrl)

        // Fetch related products with error handling
        try {
          if (productData.category) {
            const relatedRes = await buyerApi.getProducts({ category: productData.category })
            setRelatedProducts(
              (relatedRes || []).filter((p: any) => p?.productId !== productData.productId)
            )
          } else {
            setRelatedProducts([])
          }
        } catch (relatedErr) {
          console.warn('⚠️ Failed to load related products:', relatedErr)
          setRelatedProducts([])
        }

      } catch (err: any) {
        console.error('❌ Failed to load product:', err)
        
        // Handle specific error types
        if (err?.response?.status === 404 || err?.status === 404) {
          setNotFound(true)
        } else if (err?.response?.status === 500 || err?.status === 500) {
          setError('Server error. Please try again later.')
        } else {
          setError('Failed to load product. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // Check for speech synthesis support and TTS API availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeechSynthesis = 'speechSynthesis' in window
      setSpeechSupported(hasSpeechSynthesis)
      
      if (hasSpeechSynthesis) {
        console.log('✅ Speech Synthesis API is supported')
      } else {
        console.warn('⚠️ Speech Synthesis API is not supported')
      }
      
      // Test TTS API availability
      const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';
      fetch(`${apiBaseUrl}/tts`, { method: 'GET' })
        .then(response => {
          if (response.ok) {
            console.log('✅ TTS API is available')
          } else {
            console.warn('⚠️ TTS API not available, will use browser fallback')
          }
        })
        .catch(() => {
          console.warn('⚠️ TTS API not reachable, will use browser fallback')
        })
    }
  }, [])

  // ✅ Setup audio events - Optimized to prevent frequent re-renders
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration > 0) {
        const newProgress = (audio.currentTime / audio.duration) * 100
        // Debounce progress updates to prevent excessive re-renders
        if (progressTimeoutRef.current) {
          clearTimeout(progressTimeoutRef.current)
        }
        progressTimeoutRef.current = setTimeout(() => {
          setProgress(prev => Math.abs(prev - newProgress) > 0.5 ? newProgress : prev)
        }, 100) // Update every 100ms instead of every frame
      }
    }
    
    const resetOnEnd = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e)
      setIsPlaying(false)
      setProgress(0)
      toast({
        title: 'Audio Error',
        description: 'Failed to play audio. Please try again.',
        variant: 'destructive',
      })
    }

    const handleLoadStart = () => {
      console.log('Audio loading started')
    }

    const handleCanPlay = () => {
      console.log('Audio can play')
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', resetOnEnd)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', resetOnEnd)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      // Clear any pending timeout
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current)
      }
    }
  }, [toast]) // Depend on toast function

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Memoize image array for auto-rotation (moved before useEffect that uses it)
  const imageArray = useMemo(() => {
    if (!product?.images) {
      return [fallbackImg]
    }
    
    const images = []
    if (product.images.original) images.push(product.images.original)
    if (product.images.polished) images.push(product.images.polished)
    if (product.images.enhanced) images.push(product.images.enhanced)
    
    return images.length > 0 ? images : [fallbackImg]
  }, [product?.images, fallbackImg])

  // Auto-rotation effect
  useEffect(() => {
    // Only start auto-rotation if we have more than one image and auto-rotation is enabled
    if (imageArray.length <= 1 || !isAutoRotating || isPaused) {
      return
    }

    const startAutoRotation = () => {
      autoRotationRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % imageArray.length)
      }, 2000)
    }

    startAutoRotation()

    return () => {
      if (autoRotationRef.current) {
        clearInterval(autoRotationRef.current)
        autoRotationRef.current = null
      }
    }
  }, [imageArray.length, isAutoRotating, isPaused])

  // Update selectedImage when activeIndex changes
  useEffect(() => {
    if (imageArray.length > 0) {
      setSelectedImage(imageArray[activeIndex])
    }
  }, [activeIndex, imageArray])

  // Cleanup timeouts and speech on unmount
  useEffect(() => {
    return () => {
      if (autoRotationRef.current) {
        clearInterval(autoRotationRef.current)
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
      }
      // Stop any ongoing speech synthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handlePlayAudio = useCallback(async () => {
    if (!product) {
      toast({
        title: 'No Product Data',
        description: 'Product information is not available.',
        variant: 'destructive',
      })
      return
    }

    // Get the text to be read
    const textToRead = product.story?.polished?.[selectedLanguage] || 
                      product.story?.original || 
                      product.description || 
                      'No story available for this product.'

    if (!textToRead || textToRead.trim() === '') {
      toast({
        title: 'No Text Available',
        description: 'There is no story or description to read aloud.',
        variant: 'destructive',
      })
      return
    }

    try {
      // If we already have audio for this text, just play it
      if (audioUrl && !isGeneratingTTS) {
        setIsSpeaking(!isSpeaking)
        return
      }

      // Generate TTS audio
      setIsGeneratingTTS(true)
      setTtsError(null)
      
      console.log('🎤 Generating AI voice for:', textToRead.substring(0, 100) + '...')
      
      const languageCode = ttsService.getLanguageCode(selectedLanguage)
      
      const result = await ttsService.generateSpeech({
        text: textToRead,
        language: languageCode,
        voice: ttsService.getVoiceForLanguage(languageCode)
      })

      setAudioUrl(result.audioUrl)
      setIsGeneratingTTS(false)
      setIsSpeaking(true)
      
      console.log('✅ AI voice generated successfully')

    } catch (error) {
      console.error('❌ TTS generation failed:', error)
      setIsGeneratingTTS(false)
      setTtsError(error instanceof Error ? error.message : 'Failed to generate AI voice')
      
      // Fallback to browser speech synthesis
      if (speechSupported) {
        console.log('🔄 Falling back to browser speech synthesis')
        
        const languageCode = ttsService.getLanguageCode(selectedLanguage)
        
        const utterance = new SpeechSynthesisUtterance(textToRead)
        utterance.lang = languageCode
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 1.0

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
        
        toast({
          title: 'Using Browser Voice',
          description: 'AI voice unavailable, using browser text-to-speech instead.',
          variant: 'default',
        })
      } else {
        toast({
          title: 'Voice Not Available',
          description: 'Neither AI voice nor browser speech synthesis is available.',
          variant: 'destructive',
        })
      }
    }
  }, [product, selectedLanguage, audioUrl, isGeneratingTTS, isSpeaking, speechSupported, toast])

  const handleLanguageChange = useCallback((lang: 'en' | 'hi' | 'kn') => {
    setSelectedLanguage(lang)
    
    // Stop current speech and clear audio URL when switching languages
    if (isSpeaking) {
      setIsSpeaking(false)
    }
    
    // Clear the current audio URL so new TTS will be generated for the new language
    setAudioUrl(null)
    setTtsError(null)
  }, [isSpeaking])

  const handleAddToCart = useCallback(async () => {
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
  }, [product, addToCart, toast])

  const handleBuyNow = useCallback(() => {
    if (!product) return
    setBuying(true)
    router.push(`/buyer/checkout?productId=${product.productId}&quantity=1`)
  }, [product, router])

  // Memoize thumbnails with defensive programming - ALWAYS called
  const thumbnails = useMemo(() => {
    if (!product?.images) {
      return [
        { src: fallbackImg, label: 'Original' },
        { src: fallbackImg, label: 'Polished' },
      ]
    }
    
    return [
      { src: product.images.original || fallbackImg, label: 'Original' },
      { src: product.images.polished || fallbackImg, label: 'Polished' },
    ]
  }, [product?.images?.original, product?.images?.polished, fallbackImg])

  const productUrl = useMemo(() => {
    if (!product?.productId) return ''
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL || ''}/buyer/product/${product.productId}`
  }, [product?.productId])

  // Memoized callbacks - ALWAYS called
  const handleImageClick = useCallback(() => setZoomModalOpen(true), [])
  
  const handleThumbnailClick = useCallback((src: string) => {
    // Find the index of the clicked image
    const clickedIndex = imageArray.findIndex(img => img === src)
    if (clickedIndex !== -1) {
      setActiveIndex(clickedIndex)
    }
    
    // Pause auto-rotation for 10 seconds
    setIsPaused(true)
    
    // Clear any existing pause timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
    }
    
    // Resume auto-rotation after 10 seconds
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false)
    }, 10000)
  }, [imageArray])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading product...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/buyer')}
              className="w-full"
            >
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-600 text-2xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/buyer')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Browse Products
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ConfettiProvider>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Main Product Section - Refined Layout */}
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            key={`product-${product?.productId || 'loading'}`} // Stable key to prevent re-animation
          >
            {/* Product Images Section */}
            <ProductImageSection
              selectedImage={selectedImage || fallbackImg}
              thumbnails={thumbnails}
              productTitle={product?.title || 'Product'}
              fallbackImg={fallbackImg}
              onImageClick={handleImageClick}
              onThumbnailClick={handleThumbnailClick}
              activeIndex={activeIndex}
              imageArray={imageArray}
              isPaused={isPaused}
            />

            {/* Product Details Section */}
            <div className="space-y-10">
              <ProductDescriptionSection
                product={product}
                selectedLanguage={selectedLanguage}
                isPlaying={isSpeaking}
                progress={0}
                productUrl={productUrl}
                selectedImage={selectedImage}
                fallbackImg={fallbackImg}
                onLanguageChange={handleLanguageChange}
                onPlayAudio={handlePlayAudio}
                speechSupported={speechSupported}
                audioUrl={audioUrl}
                isGeneratingTTS={isGeneratingTTS}
                ttsError={ttsError}
              />

              {/* Action Buttons */}
              <ProductActionButtons
                adding={adding}
                buying={buying}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            </div>
          </motion.div>
        </div>

      {/* AI Recommendations - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <AIRecommendations 
          currentProduct={{
            productId: product.productId,
            category: product.category,
            price: product.price,
            sellerName: product.sellerInfo?.name
          }}
        />
      )}

        {/* Related Products Section */}
        <RelatedProductsSection
          relatedProducts={relatedProducts}
          fallbackImg={fallbackImg}
        />

      {/* Product Zoom Modal */}
      <ProductZoomModal
        imageUrl={selectedImage || fallbackImg}
        alt={product.title}
        isOpen={zoomModalOpen}
        onClose={() => setZoomModalOpen(false)}
      />

      {/* Chat Assistant */}
      <ChatAssistant isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />

      {/* Cart Suggestions */}
      <CartSuggestions cartItems={[]} />

      {/* Quick View Modal */}
      <QuickViewModal
        productId={quickViewProductId}
        isOpen={!!quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />

      {/* Festival Banner */}
      <FestivalBanner festival={{
        name: 'Diwali',
        date: '2024-11-01',
        color: 'from-orange-500 to-yellow-500',
        icon: '🪔',
        message: 'Celebrate the festival of lights with handcrafted treasures',
        discount: '20%'
      }} />

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
    </ConfettiProvider>
    </ErrorBoundary>
  )
}