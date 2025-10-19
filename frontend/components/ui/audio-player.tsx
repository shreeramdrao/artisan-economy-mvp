'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  audioUrl: string | null
  onPlay?: () => void
  onPause?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
  className?: string
}

export default function AudioPlayer({
  audioUrl,
  onPlay,
  onPause,
  onEnd,
  onError,
  className = '',
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Update progress when audio time changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration > 0) {
        const newProgress = (audio.currentTime / audio.duration) * 100
        setProgress(newProgress)
        setCurrentTime(audio.currentTime)
      }
    }

    const updateDuration = () => {
      setDuration(audio.duration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsLoading(false)
      onPlay?.()
    }

    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
      onEnd?.()
    }

    const handleError = () => {
      setIsPlaying(false)
      setIsLoading(false)
      onError?.('Failed to load audio')
    }

    const handleLoadStart = () => {
      setIsLoading(true)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [onPlay, onPause, onEnd, onError])

  // Handle audio URL changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    setIsLoading(true)
    setIsPlaying(false)
    setProgress(0)
    setCurrentTime(0)
    
    audio.src = audioUrl
    audio.load()
  }, [audioUrl])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch((error) => {
        console.error('Playback failed:', error)
        onError?.('Failed to play audio')
      })
    }
  }, [isPlaying, onError])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = progressRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickX = e.clientX - rect.left
    const newProgress = (clickX / rect.width) * 100
    const newTime = (newProgress / 100) * duration

    audio.currentTime = newTime
    setProgress(newProgress)
    setCurrentTime(newTime)
  }, [duration])

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }, [isMuted, volume])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    
    const audio = audioRef.current
    if (audio && !isMuted) {
      audio.volume = newVolume
    }
  }, [isMuted])

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!audioUrl) {
    return null
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <audio ref={audioRef} preload="metadata" />
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div
          ref={progressRef}
          className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer group"
          onClick={handleSeek}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <motion.div
            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
          
          {/* Progress indicator dot */}
          <motion.div
            className="absolute top-1/2 w-4 h-4 bg-orange-600 rounded-full shadow-lg transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, marginLeft: '-8px' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.1 }}
          />
        </div>
        
        {/* Time display */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={togglePlayPause}
            disabled={isLoading}
            className={`rounded-full w-10 h-10 ${
              isPlaying 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const audio = audioRef.current
              if (audio) {
                audio.currentTime = 0
                setProgress(0)
                setCurrentTime(0)
              }
            }}
            className="rounded-full w-8 h-8 p-0"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleMute}
            className="rounded-full w-8 h-8 p-0"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${(isMuted ? 0 : volume) * 100}%, #e5e7eb ${(isMuted ? 0 : volume) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>

      {/* Status Text */}
      {isLoading && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Loading AI voice...
        </div>
      )}
      
      {isPlaying && !isLoading && (
        <div className="text-center text-sm text-orange-600 mt-2 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
          Listening to AI voice...
        </div>
      )}
    </div>
  )
}
