'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface ImageWithFallbackProps {
  src: string
  alt: string
  fallbackSrc?: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  style?: React.CSSProperties
  onClick?: () => void
  loading?: 'lazy' | 'eager'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/fallback.svg',
  width,
  height,
  fill = false,
  className = '',
  sizes,
  priority = false,
  style,
  onClick,
  loading = 'lazy',
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority) // Priority images load immediately
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isInView])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
  }

  // Show placeholder while loading
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`${className} bg-gray-200 animate-pulse`}
        style={{
          width: fill ? '100%' : width || 300,
          height: fill ? '100%' : height || 300,
          ...style,
        }}
        aria-hidden="true"
      />
    )
  }

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 300}
      height={height || 300}
      className={className}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : loading}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
    />
  )
}
