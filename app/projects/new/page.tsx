"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CreateProjectForm from "@/components/create-project-form"
import Header from "@/components/header"
import type { Methodology, Industry, Project } from "@/types"
import { getMethodologies, getIndustries, createProject } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2Icon } from "lucide-react"

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [methodologies, setMethodologies] = useState<Methodology[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingData(true)
      try {
        const [fetchedMethodologies, fetchedIndustries] = await Promise.all([getMethodologies(), getIndustries()])
        setMethodologies(fetchedMethodologies)
        setIndustries(fetchedIndustries)
      } catch (error) {
        console.error("Failed to load initial data for new project form:", error)
        toast({ title: "Error", description: "Could not load form data. Please try again.", variant: "destructive" })
      } finally {
        setIsLoadingData(false)
      }
    }
    loadInitialData()
  }, [toast])

  const handleCreateProject = async (
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
  ) => {
    setIsSubmitting(true)
    try {
      const newProject = await createProject(projectData)
      toast({
        title: "Success",
        description: `Project "${newProject.project_name}" created successfully.`,
      })

      // Navigate to the sections page for the new project
      router.push(`/projects/${newProject.id}/sections`)
    } catch (error) {
      console.error("Failed to create project:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
      throw error // Re-throw to let the form handle it
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <>
        <Header pageTitle="Project Setup" stepNumber={1} />
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
          <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading form data...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header pageTitle="Project Setup" stepNumber={1} />
      <main className="container max-w-3xl mx-auto py-8 px-4 md:px-0">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Project Setup</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Configure your survey project with essential details and template variables.
          </p>
        </div>
        <CreateProjectForm
          methodologies={methodologies}
          industries={industries}
          onProjectCreate={handleCreateProject}
        />
      </main>
    </>
  )
}
