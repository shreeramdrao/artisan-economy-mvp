'use client'
import { useState, useEffect } from 'react'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    console.log('⚡ buyer client wrapper mounted')
    setReady(true)
  }, [])
  if (!ready) return null
  return <>{children}</>
}