'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ImageWithFallback from '@/components/ImageWithFallback'
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { focusFirstElement, trapFocus } from '@/lib/aria-utils'

interface ProductZoomModalProps {
  imageUrl: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export default function ProductZoomModal({ imageUrl, alt, isOpen, onClose }: ProductZoomModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  // ✅ Debug log for ProductZoomModal rendering
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('ProductZoomModal component mounted')
    }
  }, [])

  // Focus management and keyboard navigation
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
      
      // Focus first element when modal opens
      setTimeout(() => {
        focusFirstElement(modalRef.current)
      }, 100)
    }
  }, [isOpen])

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      // Close modal on Escape
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Trap focus within modal
      if (modalRef.current) {
        trapFocus(modalRef.current, e)
      }

      // Keyboard shortcuts
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
          e.preventDefault()
          handleZoomOut()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleRotate()
          break
        case '0':
          e.preventDefault()
          handleReset()
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleReset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={modalRef}
        className="max-w-7xl max-h-[95vh] p-0 bg-black/95 backdrop-blur-sm border-0 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="zoom-modal-title"
        aria-describedby="zoom-modal-description"
      >
        <div className="relative w-full h-full">
          {/* Hidden title and description for screen readers */}
          <h2 id="zoom-modal-title" className="sr-only">
            Product Image Zoom
          </h2>
          <p id="zoom-modal-description" className="sr-only">
            Use mouse or keyboard to zoom, rotate, and navigate the product image. Press Escape to close.
          </p>
          
          {/* Controls */}
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              title="Zoom out (or press -)"
              className="bg-white/20 hover:bg-white/30 text-white border-0 focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              <ZoomOut className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              title="Zoom in (or press +)"
              className="bg-white/20 hover:bg-white/30 text-white border-0 focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              <ZoomIn className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRotate}
              aria-label="Rotate image"
              title="Rotate image (or press R)"
              className="bg-white/20 hover:bg-white/30 text-white border-0 focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              <RotateCw className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleReset}
              aria-label="Reset zoom and rotation"
              title="Reset zoom and rotation (or press 0)"
              className="bg-white/20 hover:bg-white/30 text-white border-0 focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              Reset
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onClose}
              aria-label="Close zoom modal"
              title="Close zoom modal (or press Escape)"
              className="bg-white/20 hover:bg-white/30 text-white border-0 focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Zoom Info */}
          <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {Math.round(scale * 100)}%
          </div>

          {/* Image Container */}
          <div
            className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              }}
            >
              <ImageWithFallback
                src={imageUrl}
                alt={alt}
                width={800}
                height={800}
                className="max-w-none select-none"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                }}
                priority
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            Scroll to zoom • Drag to pan • Click controls to rotate
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
