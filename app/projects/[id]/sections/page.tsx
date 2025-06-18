"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import WorkflowNavigation from "@/components/workflow-navigation"
import { getProjectById, getSections, getMethodologySections, saveProjectSections, APIError, type Section as ApiSection, type MethodologySection } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeftIcon, SearchIcon, XIcon, Loader2Icon, AlertCircleIcon } from "lucide-react"
import type { Project } from "@/types"

// Define types for sections
interface Section {
  id: string
  name: string
  description: string
  questionCount: string
  type: "core" | "prophecy" | "cx" | "choice" | "segmentation" | "ua" | "ad-testing"
  isDefault?: boolean
  methodology?: string
}

export default function SectionsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiSections, setApiSections] = useState<ApiSection[]>([])
  const [methodologySections, setMethodologySections] = useState<MethodologySection[]>([])
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | Section["type"]>("all")

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true)
      try {
        const fetchedProject = await getProjectById(projectId)
        if (fetchedProject) {
          setProject(fetchedProject)
        } else {
          toast({
            title: "Error",
            description: "Project not found.",
            variant: "destructive",
          })
          router.push("/projects")
        }
      } catch (error) {
        console.error("Failed to fetch project:", error)
        toast({
          title: "Error",
          description: error instanceof APIError ? error.message : "Failed to load project. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId, router, toast])

  // Fetch sections and methodology sections
  useEffect(() => {
    const fetchSectionsData = async () => {
      setApiLoading(true)
      setApiError(null)
      try {
        const [sectionsResponse, methodologySectionsResponse] = await Promise.all([
          getSections(),
          getMethodologySections()
        ])
        
        setApiSections(sectionsResponse)
        setMethodologySections(methodologySectionsResponse)
        
        // Pre-select all sections by default
        const allSectionIds = new Set(sectionsResponse.map(section => section.id))
        setSelectedSections(allSectionIds)
      } catch (error) {
        console.error("Failed to fetch sections:", error)
        const errorMessage = error instanceof APIError 
          ? error.message 
          : "Failed to load sections. Please check your connection and try again."
        setApiError(errorMessage)
        toast({
          title: "Error Loading Sections",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setApiLoading(false)
      }
    }

    fetchSectionsData()
  }, [toast])

  // Handle section selection
  const handleSectionToggle = useCallback((sectionId: string) => {
    setSelectedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }, [])

  // Convert API sections to frontend format
  const convertApiSectionsToFrontend = (apiSections: ApiSection[], methodologySections: MethodologySection[]): Section[] => {
    return apiSections.map(section => {
      // Find if this section belongs to any methodology
      const methodologyLinks = methodologySections.filter(ms => ms.section === section.id)
      
      // Determine the type based on is_core flag
      let type: Section["type"] = section.is_core ? "core" : "prophecy"
      let primaryMethodology: string | undefined
      
      // For prophecy sections, get the methodology name
      if (!section.is_core && methodologyLinks.length > 0) {
        const uniqueMethodologies = [...new Set(methodologyLinks.map(ms => ms.methodology_name))]
        primaryMethodology = uniqueMethodologies[0]
      }

      return {
        id: section.id,
        name: section.name,
        description: section.description,
        questionCount: section.is_core ? "3-8 questions" : "4-10 questions",
        type,
        methodology: primaryMethodology,
        isDefault: true // All sections are pre-selected by default
      }
    })
  }

  // Show sections from the backend
  const sectionsToDisplay = apiSections.length > 0 
    ? convertApiSectionsToFrontend(apiSections, methodologySections)
    : []

  // Clear all selected sections
  const clearAllSections = useCallback(() => {
    setSelectedSections(new Set())
  }, [])

  // Select all sections
  const selectAllSections = useCallback(() => {
    const allSectionIds = new Set(sectionsToDisplay.map(section => section.id))
    setSelectedSections(allSectionIds)
  }, [sectionsToDisplay])

  // Apply search and filter, maintain proper grouping (Core first, then Prophecy)
  const filteredSections = sectionsToDisplay.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || section.type === filterType
    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    // First sort by type (core sections first, then prophecy)
    if (a.type === "core" && b.type === "prophecy") return -1
    if (a.type === "prophecy" && b.type === "core") return 1
    
    // Within the same type, maintain API order (display_order)
    return 0
  })

  // Handle continue to next step
  const handleContinue = async () => {
    if (selectedSections.size === 0) {
      toast({
        title: "No Sections Selected",
        description: "Please select at least one section to continue.",
        variant: "destructive",
      })
      return false
    }

    try {
      // Convert selected sections to the format expected by the API
      const sectionsToSave = Array.from(selectedSections).map((sectionId, index) => {
        const section = sectionsToDisplay.find(s => s.id === sectionId)
        return {
          section_template_id: sectionId,
          custom_title: section?.name,
          position: index + 1,
          ai_generated_notes: "",
          loi: undefined
        }
      })

      // Save sections to the project
      await saveProjectSections(projectId, sectionsToSave)
      
      toast({
        title: "Success",
        description: "Sections saved successfully.",
      })

      // Navigate to questions page
      router.push(`/projects/${projectId}/questions`)
      return true
    } catch (error) {
      console.error("Failed to save sections:", error)
      toast({
        title: "Error",
        description: error instanceof APIError ? error.message : "Failed to save sections. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  if (isLoading) {
    return (
      <>
        <Header pageTitle="Loading..." stepNumber={2} />
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
          <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading project details...</p>
        </div>
      </>
    )
  }

  if (!project) {
    return (
      <>
        <Header pageTitle="Project Not Found" stepNumber={2} />
        <div className="container mx-auto py-8 text-center">
          <p className="text-xl text-muted-foreground">Project not found.</p>
          <Button asChild className="mt-4">
            <Link href="/projects">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <Header pageTitle={`${project.project_name} - Select Sections`} stepNumber={2} />
      <WorkflowNavigation currentStep={2} projectId={projectId} />
      
      <div className="container mx-auto py-8 space-y-8">
        {/* Error Display */}
        {apiError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircleIcon className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Error Loading Sections</h3>
                  <p className="text-red-700">{apiError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>Select Survey Sections</CardTitle>
            <CardDescription>
              All sections are pre-selected for your {project.methodology_name} survey. 
              Deselect any sections you don't need. Core sections appear first, followed by Prophecy sections.
              You've selected {selectedSections.size} section{selectedSections.size !== 1 ? 's' : ''}.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              <SelectItem value="core">Core</SelectItem>
              <SelectItem value="prophecy">Prophecy</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            {selectedSections.size < sectionsToDisplay.length && (
              <Button variant="outline" onClick={selectAllSections}>
                Select All ({sectionsToDisplay.length})
              </Button>
            )}
            {selectedSections.size > 0 && (
              <Button variant="outline" onClick={clearAllSections}>
                <XIcon className="mr-2 h-4 w-4" />
                Clear All ({selectedSections.size})
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {apiLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading sections...</p>
          </div>
        )}

        {/* Sections Grid */}
        {!apiLoading && !apiError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map((section) => {
              const isSelected = selectedSections.has(section.id)
              return (
                <Card
                  key={section.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected 
                      ? "ring-2 ring-primary bg-primary/5 border-primary" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSectionToggle(section.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{section.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={section.type === "core" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {section.type === "core" ? "Core" : "Prophecy"}
                          </Badge>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? "bg-primary border-primary" 
                          : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600 mb-2">
                      {section.description}
                    </CardDescription>
                    <p className="text-xs text-gray-500">{section.questionCount}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* No Results */}
        {!apiLoading && !apiError && filteredSections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No sections found matching your criteria.</p>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filter settings.</p>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-between items-center pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/edit`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Project Details
            </Link>
          </Button>
          
          <Button 
            onClick={handleContinue}
            disabled={selectedSections.size === 0 || apiLoading}
            className="min-w-[200px]"
          >
            Continue to Questions
            {selectedSections.size > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedSections.size}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}