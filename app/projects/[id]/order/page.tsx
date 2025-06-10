"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import WorkflowNavigation from "@/components/workflow-navigation"
import { getProjectById } from "@/lib/api"
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

// Mock data for sections
const mockSections: SurveySection[] = [
  {
    id: "screeners",
    name: "Screeners",
    description: "Essential screening questions to qualify respondents",
    type: "basic",
    order: 1,
  },
  {
    id: "demographics",
    name: "Demographics",
    description: "Standard demographic questions including age, gender, location, and income",
    type: "basic",
    order: 2,
  },
  {
    id: "product-awareness",
    name: "Product Awareness",
    description: "Questions about product familiarity and recognition",
    type: "prophecy",
    order: 3,
  },
  {
    id: "purchase-intent",
    name: "Purchase Intent",
    description: "Measuring likelihood to purchase and decision factors",
    type: "prophecy",
    order: 4,
  },
]

export default function OrderPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sections, setSections] = useState<SurveySection[]>(mockSections)

  // Fetch project data
  const fetchProject = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedProject = await getProjectById(projectId)
      if (fetchedProject) {
        setProject(fetchedProject)
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" })
        router.push("/projects") // Redirect if project not found
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
      toast({ title: "Error", description: "Could not load project details.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [projectId, router, toast])

  useEffect(() => {
    if (projectId) {
      fetchProject()
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
    // In a real app, you would save the section order to the project
    console.log("Section order saved:", sections)
    return true
  }

  if (isLoading) {
    return (
      <>
        <Header title="Loading..." />
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
        <Header title="Project Not Found" />
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
      <Header pageTitle="Section Order" stepNumber={4} />
      <main className="container max-w-screen-xl mx-auto py-8 px-4 md:px-6 pb-24">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Section Order</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Arrange your survey sections in the optimal order to create a logical flow for respondents.
          </p>
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
                            : "ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
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
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSectionUp(section.id)}
                      disabled={section.order === 1}
                      className="h-8 w-8"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSectionDown(section.id)}
                      disabled={section.order === sections.length}
                      className="h-8 w-8"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consistent Navigation */}
        <WorkflowNavigation projectId={projectId} currentStep="order" onNext={handleContinue} />
      </main>
    </>
  )
}
