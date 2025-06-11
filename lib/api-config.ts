// API Configuration utility
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  useMockData: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
  
  // Helper to get full endpoint URL
  getEndpoint: (path: string) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${API_CONFIG.baseUrl}/api/${API_CONFIG.version}/${cleanPath}`
  },
  
  // Toggle between mock and real API (useful for development)
  toggleMockMode: () => {
    // This would require restarting the app to take effect
    console.log(`Mock mode is currently: ${API_CONFIG.useMockData ? 'ON' : 'OFF'}`)
    console.log('To change, update NEXT_PUBLIC_DEV_MODE in .env.local and restart the app')
  }
}

// Export endpoints for easy access
export const ENDPOINTS = {
  projects: API_CONFIG.getEndpoint('projects/'),
  methodologies: API_CONFIG.getEndpoint('methodologies/'),
  industries: API_CONFIG.getEndpoint('industries/'),
  
  // Helper methods for specific endpoints
  project: (id: string) => API_CONFIG.getEndpoint(`projects/${id}/`),
  projectQuestions: (id: string) => API_CONFIG.getEndpoint(`projects/${id}/questions/`),
  generateDocument: (id: string) => API_CONFIG.getEndpoint(`projects/${id}/generate-document/`),
} 