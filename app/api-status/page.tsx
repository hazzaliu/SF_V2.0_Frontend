"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_CONFIG, ENDPOINTS } from "@/lib/api-config"
import { CheckCircle, XCircle, RefreshCw, Settings } from "lucide-react"

interface APIStatus {
  endpoint: string
  status: 'success' | 'error' | 'pending'
  response?: any
  error?: string
  responseTime?: number
}

export default function APIStatusPage() {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const testEndpoints = [
    { name: 'Projects', url: ENDPOINTS.projects },
    { name: 'Methodologies', url: ENDPOINTS.methodologies },
    { name: 'Industries', url: ENDPOINTS.industries },
  ]

  const testAPIEndpoint = async (name: string, url: string): Promise<APIStatus> => {
    const startTime = Date.now()
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        const data = await response.json()
        return {
          endpoint: name,
          status: 'success',
          response: data,
          responseTime,
        }
      } else {
        return {
          endpoint: name,
          status: 'error',
          error: `${response.status} ${response.statusText}`,
          responseTime,
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        endpoint: name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      }
    }
  }

  const testAllEndpoints = async () => {
    setIsRefreshing(true)
    
    const results = await Promise.all(
      testEndpoints.map(endpoint => testAPIEndpoint(endpoint.name, endpoint.url))
    )
    
    setApiStatuses(results)
    setIsRefreshing(false)
  }

  useEffect(() => {
    testAllEndpoints()
  }, [])

  const getStatusIcon = (status: APIStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: APIStatus['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Testing...</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">API Status</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your backend API connection and configuration
          </p>
        </div>
        <Button onClick={testAllEndpoints} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Configuration Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Backend URL</p>
              <p className="font-mono text-sm">{API_CONFIG.baseUrl}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">API Version</p>
              <p className="font-mono text-sm">v{API_CONFIG.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mode</p>
              <Badge variant={API_CONFIG.useMockData ? "secondary" : "default"}>
                {API_CONFIG.useMockData ? "Mock Data" : "Live API"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Environment</p>
              <p className="font-mono text-sm">{process.env.NODE_ENV}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Status */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">API Endpoints</h2>
        
        {apiStatuses.map((status, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getStatusIcon(status.status)}
                  {status.endpoint}
                </CardTitle>
                {getStatusBadge(status.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">URL:</span>
                  <span className="font-mono">{testEndpoints.find(e => e.name === status.endpoint)?.url}</span>
                </div>
                
                {status.responseTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span>{status.responseTime}ms</span>
                  </div>
                )}
                
                {status.error && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Error:</span>
                    <span className="text-red-600 font-mono">{status.error}</span>
                  </div>
                )}
                
                {status.response && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Response Preview:</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(
                        Array.isArray(status.response) 
                          ? status.response.slice(0, 2) // Show first 2 items if array
                          : status.response, 
                        null, 
                        2
                      )}
                      {Array.isArray(status.response) && status.response.length > 2 && (
                        `\n... and ${status.response.length - 2} more items`
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Integration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">To switch to your backend:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Make sure your backend server is running</li>
              <li>Update <code className="bg-muted px-1 rounded">.env.local</code> with your backend URL</li>
              <li>Set <code className="bg-muted px-1 rounded">NEXT_PUBLIC_DEV_MODE=false</code> to disable mock data</li>
              <li>Restart the Next.js development server</li>
              <li>Refresh this page to test the connection</li>
            </ol>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded">
            <p className="text-sm">
              <strong>Current Status:</strong> {API_CONFIG.useMockData ? 
                "Using mock data. Your frontend is working independently." : 
                "Attempting to connect to live API. Check the endpoint statuses above."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 