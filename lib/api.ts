// API client that can work with both mock data and real backend
import type { Project, Methodology, Industry } from "@/types"

const MOCK_DELAY = 500 // ms

// Configuration from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

const API_ENDPOINTS = {
  projects: `${API_BASE_URL}/api/${API_VERSION}/projects/`,
  methodologies: `${API_BASE_URL}/api/${API_VERSION}/methodologies/`,
  industries: `${API_BASE_URL}/api/${API_VERSION}/industries/`,
}

const mockProjects: Project[] = [
  {
    id: "1",
    project_name: "Brand Awareness Study Q4 2024",
    client_name: "Acme Corp",
    project_number: "PRJ-2024-001",
    methodology_id: 1,
    methodology_name: "In-Market Ad Testing",
    industry_id: 1,
    industry_name: "Technology",
    status: "Completed",
    last_modified: "2024-05-15T10:00:00Z",
    research_objectives: "To measure brand awareness for the new product line.",
    sample_size: "N=1000",
    question_count: 4,
    estimated_duration: "3-4 min",
    loi: 4,
    target_country: "US",
    survey_sections: [
      {
        id: "s1",
        name: "Brand Awareness & Recognition",
        order: 1,
        questions: [
          {
            id: "q1a",
            question_number: "Q1",
            text: "Which of the following brands have you heard of before today? Please select all that apply.",
            type: "Multiple Choice",
            options: ["Brand A", "Brand B", "Brand C", "Brand D", "None of the above"],
          },
          {
            id: "q1b",
            question_number: "Q2",
            text: "When you think of [CATEGORY], which brand comes to mind first?",
            type: "Open Text",
          },
        ],
      },
      {
        id: "s2",
        name: "Ad Recall & Attribution",
        order: 2,
        questions: [
          {
            id: "q2a",
            question_number: "Q3",
            text: "In the past 30 days, do you recall seeing any advertisements for [BRAND]?",
            type: "Single Choice",
            options: ["Yes, I remember seeing ads", "No, I don't recall any ads", "I'm not sure"],
          },
        ],
      },
      {
        id: "s3",
        name: "Purchase Intent",
        order: 3,
        questions: [
          {
            id: "q3a",
            question_number: "Q4",
            text: "How likely are you to purchase [PRODUCT] in the next 6 months?",
            type: "Likert Scale",
            options: ["Extremely likely", "Very likely", "Somewhat likely", "Not very likely", "Not at all likely"],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    project_name: "Customer Experience Survey",
    client_name: "Beta Solutions",
    project_number: "PRJ-2024-002",
    methodology_id: 2,
    methodology_name: "CX (Customer Experience)",
    industry_id: 2,
    industry_name: "Healthcare",
    status: "Draft",
    last_modified: "2024-06-01T14:30:00Z",
    research_objectives: "Journey mapping and satisfaction measurement.",
    sample_size: "N=500",
    question_count: 8,
    estimated_duration: "6-8 min",
    loi: 7,
    target_country: "AU",
  },
  {
    id: "3",
    project_name: "Price Sensitivity Analysis",
    client_name: "Gamma Inc.",
    project_number: "PRJ-2024-003",
    methodology_id: 3,
    methodology_name: "Choice Modelling",
    industry_id: 3,
    industry_name: "Retail",
    status: "In Progress",
    last_modified: "2024-06-05T09:00:00Z",
    research_objectives: "PTF methodology for pricing optimization.",
    sample_size: "N=800",
    question_count: 6,
    estimated_duration: "4-5 min",
    loi: 5,
    target_country: "UK",
  },
]

const mockMethodologies: Methodology[] = [
  {
    id: 1,
    name: "In-Market Ad Testing",
    description: "Test advertisement effectiveness in real market conditions",
    sections_count: 5,
  },
  {
    id: 2,
    name: "CX (Customer Experience)",
    description: "Comprehensive customer experience measurement and satisfaction modeling.",
    sections_count: 5,
  },
  { id: 3, name: "Choice Modelling", description: "Discrete choice experiments and modeling", sections_count: 4 },
  { id: 4, name: "Prophecy", description: "Predictive market research for future outcomes.", sections_count: 5 },
  { id: 5, name: "Segmentation", description: "Market and customer segmentation analysis", sections_count: 3 },
  { id: 6, name: "U&A", description: "Usage and Attitudes studies", sections_count: 4 },
]

const mockIndustries: Industry[] = [
  { id: 1, name: "Technology" },
  { id: 2, name: "Healthcare" },
  { id: 3, name: "Retail" },
  { id: 4, name: "Finance" },
  { id: 5, name: "Manufacturing" },
  { id: 6, name: "Lifestyles" },
  { id: 7, name: "Banking & Superannuation" },
  { id: 8, name: "Energy" },
  { id: 9, name: "Telecommunications" },
  { id: 10, name: "Education" },
  { id: 11, name: "Miscellaneous" },
]

// Helper function for making API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(endpoint, config)
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

export async function getProjects(): Promise<Project[]> {
  console.log("API: Fetching projects...")
  
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => setTimeout(() => resolve([...mockProjects]), MOCK_DELAY))
  }
  
  try {
    const response = await apiCall<{results: Project[]}>(API_ENDPOINTS.projects)
    // Extract the results array from the paginated response
    return response.results || []
  } catch (error) {
    console.warn("API call failed, falling back to mock data:", error)
    return mockProjects
  }
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  console.log(`API: Fetching project by id ${id}...`)
  
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => setTimeout(() => resolve(mockProjects.find((p) => p.id === id)), MOCK_DELAY))
  }
  
  try {
    const data = await apiCall<Project>(`${API_ENDPOINTS.projects}${id}/`)
    return data
  } catch (error) {
    console.warn("API call failed, falling back to mock data:", error)
    return mockProjects.find((p) => p.id === id)
  }
}

export async function createProject(
  projectData: Omit<
    Project,
    | "id"
    | "status"
    | "last_modified"
    | "methodology_name"
    | "industry_name"
    | "question_count"
    | "estimated_duration"
    | "survey_sections"
  >,
): Promise<Project> {
  console.log("API: Creating project...", projectData)
  
  if (USE_MOCK_DATA) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Validate required fields
          if (!projectData.project_name || !projectData.client_name || !projectData.project_number) {
            reject(new Error("Missing required fields"))
            return
          }

          const newProject: Project = {
            ...projectData,
            id: String(Date.now()), // Generate unique ID
            status: "Draft",
            last_modified: new Date().toISOString(),
            methodology_name: mockMethodologies.find((m) => m.id === projectData.methodology_id)?.name || "Unknown",
            industry_name: mockIndustries.find((i) => i.id === projectData.industry_id)?.name || "Unknown",
            question_count: 0,
            estimated_duration: "TBD",
          }

          // Add to the beginning of the mock projects array
          mockProjects.unshift(newProject)

          console.log("API: Project created successfully", newProject)
          resolve(newProject)
        } catch (error) {
          console.error("API: Failed to create project", error)
          reject(error)
        }
      }, MOCK_DELAY)
    })
  }
  
  try {
    const data = await apiCall<Project>(API_ENDPOINTS.projects, {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
    return data
  } catch (error) {
    console.error("API: Failed to create project", error)
    throw error
  }
}

export async function updateProject(
  id: string,
  projectData: Partial<
    Omit<
      Project,
      | "id"
      | "status"
      | "last_modified"
      | "methodology_name"
      | "industry_name"
      | "question_count"
      | "estimated_duration"
      | "survey_sections"
    >
  >,
): Promise<Project | undefined> {
  console.log(`API: Updating project ${id}...`, projectData)
  return new Promise((resolve) => {
    setTimeout(() => {
      const projectIndex = mockProjects.findIndex((p) => p.id === id)
      if (projectIndex !== -1) {
        mockProjects[projectIndex] = {
          ...mockProjects[projectIndex],
          ...projectData,
          methodology_id: projectData.methodology_id || mockProjects[projectIndex].methodology_id,
          industry_id: projectData.industry_id || mockProjects[projectIndex].industry_id,
          methodology_name: mockMethodologies.find(
            (m) => m.id === (projectData.methodology_id || mockProjects[projectIndex].methodology_id),
          )?.name,
          industry_name: mockIndustries.find(
            (i) => i.id === (projectData.industry_id || mockProjects[projectIndex].industry_id),
          )?.name,
          last_modified: new Date().toISOString(),
        } as Project
        resolve(mockProjects[projectIndex])
      } else {
        resolve(undefined)
      }
    }, MOCK_DELAY)
  })
}

export async function getMethodologies(): Promise<Methodology[]> {
  console.log("API: Fetching methodologies...")
  
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => setTimeout(() => resolve([...mockMethodologies]), MOCK_DELAY))
  }
  
  try {
    const response = await apiCall<{results: Methodology[]}>(API_ENDPOINTS.methodologies)
    // Extract the results array from the paginated response
    return response.results || []
  } catch (error) {
    console.warn("API call failed, falling back to mock data:", error)
    return mockMethodologies
  }
}

export async function getIndustries(): Promise<Industry[]> {
  console.log("API: Fetching industries...")
  
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => setTimeout(() => resolve([...mockIndustries]), MOCK_DELAY))
  }
  
  try {
    const response = await apiCall<{results: Industry[]}>(API_ENDPOINTS.industries)
    // Extract the results array from the paginated response
    return response.results || []
  } catch (error) {
    console.warn("API call failed, falling back to mock data:", error)
    return mockIndustries
  }
}

export async function generateSurveyDocument(projectId: string, format: "docx" | "pdf" | "csv"): Promise<Blob> {
  console.log(`API: Generating ${format} document for project ${projectId}...`)
  return new Promise((resolve) => {
    setTimeout(() => {
      const content = `Mock ${format.toUpperCase()} document for project ${projectId}. Generated on ${new Date().toLocaleString()}`
      const blob = new Blob([content], {
        type:
          format === "csv"
            ? "text/csv"
            : format === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      resolve(blob)
    }, MOCK_DELAY * 2)
  })
}
