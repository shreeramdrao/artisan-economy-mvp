'use client'

import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

export function OfflineListener() {
  const { toastWarning, toastSuccess } = useToast()

  useEffect(() => {
    const handleOffline = () => {
      toastWarning('You are offline. Some features may not work properly.', 'Offline')
    }

    const handleOnline = () => {
      toastSuccess('You are back online!', 'Online')
    }

    // Add event listeners
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    // Cleanup
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [toastWarning, toastSuccess])

  return null // This component doesn't render anything
}

export default OfflineListener
