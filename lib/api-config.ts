// API Configuration utility
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  
  // Helper to get full endpoint URL
  getEndpoint: (path: string) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${API_CONFIG.baseUrl}/api/${API_CONFIG.version}/${cleanPath}`
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