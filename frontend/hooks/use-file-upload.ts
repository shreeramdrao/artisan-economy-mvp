'use client'

import { useState, useCallback } from 'react'

type FileType = 'image' | 'audio' | 'video' | 'document' | 'any'

interface UseFileUploadOptions {
  maxSizeMB?: number
  allowedTypes?: string[] // MIME types (e.g., ['image/jpeg', 'image/png'])
}

export default function useFileUpload(options: UseFileUploadOptions = {}) {
  const { maxSizeMB = 10, allowedTypes = [] } = options

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Validate file before accepting
  const validateFile = (file: File): boolean => {
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      setError(`❌ Invalid file type: ${file.type}`)
      return false
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`❌ File size exceeds ${maxSizeMB}MB limit`)
      return false
    }

    return true
  }

  // Handle file selection from input
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile)
        setPreviewUrl(URL.createObjectURL(selectedFile))
        setError(null)
      } else {
        setFile(null)
        setPreviewUrl(null)
      }
    },
    []
  )

  // Handle drag & drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile)
        setPreviewUrl(URL.createObjectURL(droppedFile))
        setError(null)
      } else {
        setFile(null)
        setPreviewUrl(null)
      }
    },
    []
  )

  // Prevent default drag events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  // Clear file
  const clearFile = useCallback(() => {
    setFile(null)
    setPreviewUrl(null)
    setError(null)
  }, [])

  return {
    file,
    previewUrl,
    error,
    handleFileChange,
    handleDrop,
    handleDragOver,
    clearFile,
  }
}