"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import WorkflowNavigation from "@/components/workflow-navigation"
import { ErrorBoundary, useErrorHandler } from "@/components/error-boundary"
import { getProjectById, getProjectSectionsDetailed, updateSectionOrder } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeftIcon, Loader2Icon, GripVertical } from "lucide-react"
import type { Project } from "@/types"

// Define types for sections
interface SurveySection {
  id: string
  name: string
  description: string
  type: "basic" | "prophecy" | "cx" | "choice"
  order: number
}

function OrderPageContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  // Use error handler to suppress browser extension errors
  useErrorHandler()

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sections, setSections] = useState<SurveySection[]>([])

  // Helper function to determine section type based on methodology
  // getSectionType function removed - now using backend-provided section_category

  // Fetch project data and sections separately
  const fetchProject = useCallback(async () => {
    setIsLoading(true)
    let isCancelled = false
    
    try {
      // Fetch project and sections in parallel
      const [fetchedProject, projectSections] = await Promise.all([
        getProjectById(projectId),
        getProjectSectionsDetailed(projectId)
      ])
      
      // Check if component was unmounted during fetch
      if (isCancelled) return
      
      if (fetchedProject) {
        setProject(fetchedProject)
        
        // Convert project sections to local SurveySection format
        if (projectSections && projectSections.length > 0) {
          const convertedSections: SurveySection[] = projectSections.map((section, index) => ({
            id: section.id,
            name: section.name || "Unnamed Section",
            description: section.description || "No description available",
            type: section.section_category || "basic", // Use backend-provided categorization
            order: section.position || index + 1 // Use user-defined position from backend
          }))
          
          // Sort by order if available
          convertedSections.sort((a, b) => a.order - b.order)
          setSections(convertedSections)
          
          console.log(`✅ Found ${convertedSections.length} sections for project ${projectId}`)
        } else {
          // No sections found - user hasn't selected sections yet
          console.log(`⚠️ No sections found for project ${projectId}`)
          if (!isCancelled) {
            toast({ 
              title: "No Sections Found", 
              description: "Please go back to the Section Library to select your survey sections first.", 
              variant: "destructive" 
            })
          }
        }
      } else {
        if (!isCancelled) {
          toast({ title: "Error", description: "Project not found.", variant: "destructive" })
          router.push("/projects") // Redirect if project not found
        }
      }
    } catch (error) {
      console.error("Failed to fetch project or sections:", error)
      if (!isCancelled) {
        toast({ 
          title: "Error", 
          description: "Could not load project details. Please try refreshing the page.", 
          variant: "destructive" 
        })
      }
    } finally {
      if (!isCancelled) {
        setIsLoading(false)
      }
    }
    
    // Cleanup function to mark request as cancelled
    return () => {
      isCancelled = true
    }
  }, [projectId, router, toast])

  useEffect(() => {
    if (projectId) {
      const cleanup = fetchProject()
      
      // Return cleanup function for useEffect
      return () => {
        if (cleanup && typeof cleanup.then === 'function') {
          cleanup.then(cleanupFn => {
            if (typeof cleanupFn === 'function') {
              cleanupFn()
            }
          }).catch(() => {
            // Ignore cleanup errors
          })
        }
      }
    }
  }, [projectId, fetchProject])

  // Move section up in order
  const moveSectionUp = (sectionId: string) => {
    setSections((prev) => {
      const sectionIndex = prev.findIndex((s) => s.id === sectionId)
      if (sectionIndex <= 0) return prev // Already at the top

      const newSections = [...prev]
      const temp = newSections[sectionIndex]
      newSections[sectionIndex] = newSections[sectionIndex - 1]
      newSections[sectionIndex - 1] = temp

      // Update order numbers
      return newSections.map((section, index) => ({
        ...section,
        order: index + 1,
      }))
    })
  }

  // Move section down in order
  const moveSectionDown = (sectionId: string) => {
    setSections((prev) => {
      const sectionIndex = prev.findIndex((s) => s.id === sectionId)
      if (sectionIndex === -1 || sectionIndex >= prev.length - 1) return prev // Already at the bottom

      const newSections = [...prev]
      const temp = newSections[sectionIndex]
      newSections[sectionIndex] = newSections[sectionIndex + 1]
      newSections[sectionIndex + 1] = temp

      // Update order numbers
      return newSections.map((section, index) => ({
        ...section,
        order: index + 1,
      }))
    })
  }

  // Handle continue to next step
  const handleContinue = async () => {
    try {
      // Save the section order to the backend
      const sectionIds = sections
        .sort((a, b) => a.order - b.order) // Sort by order
        .map(section => section.id) // Extract IDs in the correct order
      
      console.log("Saving section order:", sectionIds)
      
      await updateSectionOrder(projectId, sectionIds)
      
      toast({
        title: "Success", 
        description: "Section order saved successfully."
      })
      
      return true
    } catch (error) {
      console.error("Failed to save section order:", error)
      toast({
        title: "Error",
        description: "Failed to save section order. Please try again.",
        variant: "destructive"
      })
      return false
    }
  }

  if (isLoading) {
    return (
      <>
        <Header pageTitle="Loading..." stepNumber={4} />
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
        <Header pageTitle="Project Not Found" stepNumber={4} />
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

  // Show message if no sections are available
  if (sections.length === 0) {
    return (
      <>
        <Header pageTitle="Section Order" stepNumber={4} />
        <main className="container max-w-screen-xl mx-auto py-8 px-4 md:px-6 pb-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Section Order</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              No sections found for this project. Please go back to select your survey sections first.
            </p>
          </div>
          
          <div className="text-center">
            <Button asChild>
              <Link href={`/projects/${projectId}/sections`}>
                Go to Section Library
              </Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header pageTitle="Section Order" stepNumber={4} />
      <main className="container max-w-screen-xl mx-auto py-8 px-4 md:px-6 pb-24">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Section Order</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Arrange your survey sections in the optimal order to create a logical flow for respondents.
          </p>
        </div>

        {/* Project Info */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">{project.project_name}</h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Methodology:</strong> {project.methodology_name}</p>
            <p><strong>Industry:</strong> {project.industry_name}</p>
            <p><strong>Total Sections:</strong> {sections.length}</p>
          </div>
        </div>

        {/* Section Order List */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Survey Flow</CardTitle>
            <CardDescription>Drag and drop sections to reorder them or use the arrow buttons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="mr-4 text-muted-foreground">
                    <GripVertical className="h-6 w-6 cursor-move" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {section.order}
                      </Badge>
                      <h3 className="text-lg font-medium">{section.name}</h3>
                      <Badge
                        variant="outline"
                        className={
                          section.type === "basic"
                            ? "ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : section.type === "prophecy"
                            ? "ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                            : section.type === "cx"
                            ? "ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        }
                      >
                        {section.type === "basic"
                          ? "Basic"
                          : section.type === "prophecy"
                          ? "Prophecy"
                          : section.type === "cx"
                          ? "CX"
                          : "Choice"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSectionUp(section.id)}
                      disabled={section.order === 1}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSectionDown(section.id)}
                      disabled={section.order === sections.length}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consistent Navigation */}
        <WorkflowNavigation
          projectId={projectId}
          currentStep="order"
          onNext={handleContinue}
        />
      </main>
    </>
  )
}

export default function OrderPage() {
  return (
    <ErrorBoundary>
      <OrderPageContent />
    </ErrorBoundary>
  )
}
