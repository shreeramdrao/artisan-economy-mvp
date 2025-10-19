'use client'

import { motion } from 'framer-motion'
import ImageWithFallback from '@/components/ImageWithFallback'

interface ProductImageSectionProps {
  selectedImage: string | null
  thumbnails: Array<{ src: string; label: string }>
  productTitle: string
  fallbackImg: string
  onImageClick: () => void
  onThumbnailClick: (src: string) => void
  activeIndex?: number
  imageArray?: string[]
  isPaused?: boolean
}

export default function ProductImageSection({
  selectedImage,
  thumbnails,
  productTitle,
  fallbackImg,
  onImageClick,
  onThumbnailClick,
  activeIndex = 0,
  imageArray = [],
  isPaused = false,
}: ProductImageSectionProps) {
  // Early return if no thumbnails available
  if (!thumbnails || thumbnails.length === 0) {
    return (
      <div className="space-y-6">
        <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-square bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="aspect-square bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Main Product Image */}
      <motion.div 
        className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg group cursor-zoom-in relative border border-gray-100"
        style={{ position: 'relative', contain: 'layout' }}
        onClick={onImageClick}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image container with smooth transitions */}
        <div className="relative w-full h-full">
          {imageArray.length > 0 ? (
            imageArray.map((imageSrc, index) => (
              <motion.div
                key={`${imageSrc}-${index}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: index === activeIndex ? 1 : 0,
                  transition: { duration: 0.5, ease: "easeInOut" }
                }}
                exit={{ opacity: 0 }}
              >
                <ImageWithFallback
                  src={imageSrc}
                  alt={`${productTitle} - Handcrafted artisan product (${index + 1})`}
                  fill
                  className="w-full h-full object-cover"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </motion.div>
            ))
          ) : (
            <ImageWithFallback
              src={selectedImage || fallbackImg}
              alt={`${productTitle} - Handcrafted artisan product`}
              fill
              className="w-full h-full object-cover"
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        
        {/* Auto-rotation indicator */}
        {imageArray.length > 1 && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              {activeIndex + 1} / {imageArray.length}
            </div>
            {isPaused && (
              <div className="bg-orange-500/80 text-white px-2 py-1 rounded-full text-xs">
                ⏸️ Paused
              </div>
            )}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.div 
            className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-md"
            initial={{ scale: 0.9, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Click to zoom
          </motion.div>
        </div>
      </motion.div>

      {/* Thumbnail Gallery */}
      <motion.div 
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {thumbnails.map((thumb, index) => {
          const isActive = imageArray.length > 0 ? imageArray[activeIndex] === thumb.src : selectedImage === thumb.src
          return (
            <motion.div
              key={`${thumb.label}-${thumb.src}`} // Stable key with both label and src
              className={`aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 bg-white border border-gray-100 ${
                isActive
                  ? 'ring-2 ring-amber-400 shadow-md' 
                  : 'hover:shadow-md'
              }`}
              style={{ position: 'relative', contain: 'layout' }}
              onClick={() => onThumbnailClick(thumb.src)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ImageWithFallback
                src={thumb.src}
                alt={`${thumb.label} view of ${productTitle}`}
                fill
                className="w-full h-full object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
