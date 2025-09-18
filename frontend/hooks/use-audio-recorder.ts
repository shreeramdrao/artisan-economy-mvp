'use client'

import { useState, useRef, useCallback } from 'react'

export default function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  // 🎤 Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const options: MediaRecorderOptions = {
        mimeType: 'audio/webm; codecs=opus',
        audioBitsPerSecond: 128000, // Good balance quality/size
      }

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Error starting recording:', err)
      alert('🎤 Microphone access denied or not available')
    }
  }, [])

  // 🛑 Stop recording and return Blob
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null)
        return
      }

      const mediaRecorder = mediaRecorderRef.current

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm; codecs=opus' })
        resolve(blob)

        // Stop all active tracks (release mic)
        mediaRecorder.stream.getTracks().forEach((track) => track.stop())

        mediaRecorderRef.current = null
        setIsRecording(false)
      }

      mediaRecorder.stop()
    })
  }, [])

  return {
    isRecording,
    startRecording,
    stopRecording,
  }
}