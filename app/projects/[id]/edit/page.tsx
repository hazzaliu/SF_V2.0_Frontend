"use client"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import ProjectForm from "@/components/project-form"
import Header from "@/components/header"
import type { Methodology, Industry, Project } from "@/types"
import { getMethodologies, getIndustries, getProjectById, updateProject } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2Icon, ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [methodologies, setMethodologies] = useState<Methodology[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadInitialData = useCallback(async () => {
    setIsLoadingData(true)
    try {
      const [fetchedMethodologies, fetchedIndustries, fetchedProject] = await Promise.all([
        getMethodologies(),
        getIndustries(),
        getProjectById(projectId),
      ])
      setMethodologies(fetchedMethodologies)
      setIndustries(fetchedIndustries)
      if (fetchedProject) {
        setProject(fetchedProject)
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" })
        router.push("/")
      }
    } catch (error) {
      console.error("Failed to load data for edit project form:", error)
      toast({ title: "Error", description: "Could not load form data. Please try again.", variant: "destructive" })
    } finally {
      setIsLoadingData(false)
    }
  }, [projectId, router, toast])

  useEffect(() => {
    if (projectId) {
      loadInitialData()
    }
  }, [projectId, loadInitialData])

  const handleUpdateProject = async (
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
    if (!project) return
    setIsSubmitting(true)
    try {
      const updated = await updateProject(project.id, projectData)
      if (updated) {
        toast({ title: "Success", description: `Project "${updated.project_name}" updated.` })
        router.push(`/projects/${updated.id}/sections`) // Redirect to section library instead of project details
        return updated
      } else {
        toast({
          title: "Error",
          description: "Failed to update project. Project not found or error occurred.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update project:", error)
      toast({ title: "Error", description: "Failed to update project. Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <>
        <Header pageTitle="Edit Project" />
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
          <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading project data...</p>
        </div>
      </>
    )
  }

  if (!project) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-8 text-center">
          <p className="text-xl text-muted-foreground">Project not found.</p>
          <Button asChild className="mt-4">
            <Link href="/">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <Header pageTitle={`Edit: ${project?.project_name || "Project"}`} stepNumber={1} />
      <main className="container max-w-3xl mx-auto py-8 px-4 md:px-0">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href={`/projects/${project.id}`}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Project Details
          </Link>
        </Button>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground mt-2 text-lg">Update the details for your survey project.</p>
        </div>
        <ProjectForm
          project={project}
          methodologies={methodologies}
          industries={industries}
          onSave={handleUpdateProject}
          isSubmitting={isSubmitting}
        />
      </main>
    </>
  )
}
