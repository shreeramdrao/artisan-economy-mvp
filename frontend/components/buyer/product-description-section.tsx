'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import ImageWithFallback from '@/components/ImageWithFallback'
import CaptionGenerator from '@/components/CaptionGenerator'
import AudioPlayer from '@/components/ui/audio-player'

interface ProductDescriptionSectionProps {
  product: any
  selectedLanguage: 'en' | 'hi' | 'kn'
  isPlaying: boolean
  progress: number
  productUrl: string
  selectedImage: string | null
  fallbackImg: string
  onLanguageChange: (lang: 'en' | 'hi' | 'kn') => void
  onPlayAudio: () => void
  speechSupported?: boolean
  audioUrl?: string | null
  isGeneratingTTS?: boolean
  ttsError?: string | null
}

export default function ProductDescriptionSection({
  product,
  selectedLanguage,
  isPlaying,
  progress,
  productUrl,
  selectedImage,
  fallbackImg,
  onLanguageChange,
  onPlayAudio,
  speechSupported = true,
  audioUrl = null,
  isGeneratingTTS = false,
  ttsError = null,
}: ProductDescriptionSectionProps) {
  // Defensive rendering - ensure product exists
  if (!product) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Product Title and Price */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h1 
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight" 
          data-testid="product-title"
        >
          {product.title}
        </h1>
        
        {/* Price Display */}
        <motion.div 
          className="text-2xl md:text-3xl font-bold text-orange-600"
          data-testid="product-price"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {formatPrice(product.price)}
        </motion.div>
      </motion.div>

      {/* Artisan Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ImageWithFallback
                src={product.sellerInfo?.avatarUrl || '/images/default-avatar.png'}
                alt={`${product.sellerInfo?.name || 'Artisan'} profile picture`}
                width={60}
                height={60}
                className="w-15 h-15 rounded-full object-cover border-2 border-gray-100"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {product.sellerInfo?.name || 'Artisan'}
              </h3>
              <p className="text-gray-600 flex items-center gap-1 text-sm">
                <span>🇮🇳</span> 
                {product.sellerInfo?.location || 'India'}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Artisan's Story Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="space-y-4">
          {/* Story Header */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm">📖</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Artisan&apos;s Story</h3>
          </div>

          {/* Story Content */}
          <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {product.story?.polished?.[selectedLanguage] ||
                  product.story?.original ||
                  'No story available for this product.'}
              </p>
              
              {/* AI Voice Controls */}
              {speechSupported ? (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <select
                      value={selectedLanguage}
                      onChange={(e) =>
                        onLanguageChange(e.target.value as 'en' | 'hi' | 'kn')
                      }
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="hi">🇮🇳 हिंदी</option>
                      <option value="kn">🇮🇳 ಕನ್ನಡ</option>
                    </select>
                    <Button 
                      size="sm" 
                      onClick={onPlayAudio}
                      disabled={isGeneratingTTS || (!product?.story?.polished?.[selectedLanguage] && !product?.story?.original && !product?.description)}
                      className={`rounded-lg px-4 py-2 transition-all duration-300 ${
                        isGeneratingTTS
                          ? 'bg-gray-400 cursor-not-allowed'
                          : isPlaying 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      {isGeneratingTTS ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Generating AI Voice...
                        </>
                      ) : isPlaying ? (
                        '⏹️ Stop'
                      ) : (
                        '🎧 Listen with AI Voice'
                      )}
                    </Button>
                  </div>
                  
                  {/* Audio Player */}
                  {audioUrl && (
                    <AudioPlayer
                      audioUrl={audioUrl}
                      onPlay={() => {}}
                      onPause={() => {}}
                      onEnd={() => {}}
                      onError={(error) => console.error('Audio player error:', error)}
                      className="mt-2"
                    />
                  )}
                  
                  {/* Error Display */}
                  {ttsError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">
                        <strong>AI Voice Error:</strong> {ttsError}
                      </p>
                      <p className="text-xs text-red-500 mt-1">
                        Falling back to browser text-to-speech
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 italic">
                    🔊 Text-to-speech not supported in your browser
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Caption Generator Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
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
        </Card>
      </motion.div>
    </motion.div>
  )
}
