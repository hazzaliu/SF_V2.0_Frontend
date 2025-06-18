"use client"

import { useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Wifi, RefreshCw } from "lucide-react"
import { APIError } from "@/lib/api"

interface ErrorHandlerProps {
  error: Error | APIError | null
  onRetry?: () => void
  onStartOver?: () => void
  className?: string
}

export default function ErrorHandler({ error, onRetry, onStartOver, className }: ErrorHandlerProps) {
  useEffect(() => {
    if (error) {
      console.error('Error caught by ErrorHandler:', error)
    }
  }, [error])

  if (!error) return null

  const isAPIError = error instanceof APIError
  const errorType = isAPIError ? error.type : 'API_FAILURE'

  const getErrorContent = () => {
    switch (errorType) {
      case 'NETWORK_TIMEOUT':
        return {
          icon: <Wifi className="h-4 w-4" />,
          title: "Network Timeout",
          description: "The request took too long to complete. Please check your internet connection and try again.",
          variant: "destructive" as const,
          showRetry: true,
        }
      
      case 'PARTIAL_DATA_LOSS':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Partial Data Loss",
          description: "Some data could not be saved properly. Please start over to ensure all information is captured correctly.",
          variant: "destructive" as const,
          showStartOver: true,
        }
      
      case 'API_FAILURE':
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "API Failure",
          description: isAPIError && error.status 
            ? `Server error (${error.status}): ${error.message}`
            : "An unexpected error occurred while communicating with the server. Please try again.",
          variant: "destructive" as const,
          showRetry: true,
        }
    }
  }

  const { icon, title, description, variant, showRetry, showStartOver } = getErrorContent()

  return (
    <Alert variant={variant} className={className}>
      {icon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {description}
        
        <div className="flex gap-2 mt-4">
          {showRetry && onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </Button>
          )}
          
          {showStartOver && onStartOver && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onStartOver}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Start Over
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Hook for consistent error handling across components
export function useErrorHandler() {
  const handleError = (error: Error | APIError, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error)
    
    // You could also send errors to a logging service here
    // logErrorToService(error, context)
  }

  return { handleError }
} 