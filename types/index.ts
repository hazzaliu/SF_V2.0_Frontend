export interface Methodology {
  id: number | string // Allow string for form values
  name: string
  description?: string
  sections_count?: number // For SectionLibrary.html
}

export interface Industry {
  id: number | string
  name: string
}

export interface ProjectVariable {
  name: string
  value: string
}

export interface TrackedSupplier {
  id?: string
  code: string
  name: string
  is_prophecy_supplier: boolean
}

export interface Project {
  id: string
  client_name: string
  project_name: string
  project_number: string
  methodology_id: number | string
  methodology_name?: string
  industry_id: number | string
  industry_name?: string
  research_objectives: string
  sample_size: string
  loi?: number // Length of Interview from ProjectSetup.html
  target_country?: string // From ProjectSetup.html
  sample_type?: "panel" | "client" // From ProjectSetup.html
  sample_profile?: string // From ProjectSetup.html
  language_preference?: string // From ProjectSetup.html
  addressable_market?: string // From ProjectSetup.html
  streams?: string // From ProjectSetup.html
  template_variables?: ProjectVariable[] // From ProjectSetup.html
  tracked_suppliers?: TrackedSupplier[] // Tracked suppliers for the project
  category?: string // Product/service category
  target_audience?: string // Target audience description
  status: "Draft" | "In Progress" | "Completed"
  last_modified: string // ISO date string
  question_count?: number // For dashboard
  estimated_duration?: string // For dashboard
  // For project detail page, we might have more detailed survey structure
  survey_sections?: SurveySection[]
  design_brief_file_name?: string // Name of the uploaded design brief
}

export interface SurveySection {
  id: string
  project_id: string
  section_template_id: string
  section_template_name: string
  custom_title: string
  position: number
  ai_generated_notes: string
  loi: number | null
  created_at: string
  updated_at: string
  questions: SurveyQuestion[]
  // Legacy fields for backward compatibility
  name?: string
  description?: string
  order?: number
}

export interface SurveyQuestion {
  id: string
  question_number: string // e.g., Q1
  text: string
  type: "Single Choice" | "Multiple Choice" | "Open Text" | "Likert Scale" // etc.
  options?: string[]
  is_ai_generated?: boolean
}

// Props for ProjectForm
export interface ProjectFormProps {
  project?: Project // Optional: for editing
  methodologies: Methodology[]
  industries: Industry[]
  onSave: (
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
  ) => Promise<Project | void>
  isSubmitting: boolean
}

export interface CreateProjectFormProps {
  methodologies: Methodology[]
  industries: Industry[]
  onProjectCreate: (
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
    designBriefFile?: File
  ) => Promise<void>
}
