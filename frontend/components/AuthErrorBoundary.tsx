'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('Auth Error Boundary caught an error:', error, errorInfo)
    
    // If it's an auth-related error, trigger logout
    if (this.isAuthError(error)) {
      console.error('Auth error detected, triggering logout:', error)
      // The logout will be handled by the AuthErrorFallback component
    }
  }

  private isAuthError(error: Error): boolean {
    const authErrorMessages = [
      'auth',
      'token',
      'jwt',
      'unauthorized',
      'forbidden',
      'authentication',
      'authorization',
    ]
    
    const errorMessage = error.message.toLowerCase()
    return authErrorMessages.some(keyword => errorMessage.includes(keyword))
  }

  render() {
    if (this.state.hasError) {
      return <AuthErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

// Fallback component that handles auth errors
function AuthErrorFallback({ error }: { error?: Error }) {
  const { logout } = useAuth()

  React.useEffect(() => {
    if (error && isAuthError(error)) {
      console.error('Auth error detected in fallback, triggering logout:', error)
      logout()
    }
  }, [error, logout])

  const isAuthError = (err: Error): boolean => {
    const authErrorMessages = [
      'auth',
      'token',
      'jwt',
      'unauthorized',
      'forbidden',
      'authentication',
      'authorization',
    ]
    
    const errorMessage = err.message.toLowerCase()
    return authErrorMessages.some(keyword => errorMessage.includes(keyword))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Authentication Error
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              An authentication error occurred. You will be redirected to the login page.
            </p>
          </div>
          
          <div className="mt-6">
            <button
              onClick={logout}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthErrorBoundary
