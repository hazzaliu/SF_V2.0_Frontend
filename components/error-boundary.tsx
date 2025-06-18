"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Handle specific async listener errors
    if (error.message.includes('listener indicated an asynchronous response') || 
        error.message.includes('message channel closed')) {
      console.warn('Browser extension or async listener error detected:', error.message)
    }
  }

  componentDidMount() {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Prevent the default browser behavior
      event.preventDefault()
      
      // Check if it's the specific async listener error
      if (event.reason?.message?.includes('listener indicated an asynchronous response') ||
          event.reason?.message?.includes('message channel closed')) {
        console.warn('Suppressing browser extension async listener error')
        return
      }
      
      // For other errors, still log but don't crash the app
      this.setState({ 
        hasError: true, 
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }

  render() {
    if (this.state.hasError) {
      const CustomFallback = this.props.fallback
      
      if (CustomFallback) {
        return (
          <CustomFallback 
            error={this.state.error || new Error('Unknown error')} 
            reset={() => this.setState({ hasError: false, error: undefined })}
          />
        )
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress specific browser extension errors
      if (event.reason?.message?.includes('listener indicated an asynchronous response') ||
          event.reason?.message?.includes('message channel closed')) {
        console.warn('Suppressing browser extension async listener error:', event.reason.message)
        event.preventDefault()
        return
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
} 