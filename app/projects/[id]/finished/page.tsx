"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import { getProjectById } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircleIcon, HomeIcon, Loader2Icon } from "lucide-react"
import { Download, ArrowRight, Home } from "lucide-react"
import type { Project } from "@/types"

export default function ProjectFinishedPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch project data
  const fetchProject = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedProject = await getProjectById(projectId)
      if (fetchedProject) {
        setProject(fetchedProject)
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" })
        router.push("/")
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

  // Mock project statistics
  const projectStats = {
    totalQuestions: 12,
    estimatedTime: 8,
    sections: 4,
    exportFormat: "DOCX",
  }

  // Handle actions
  const handleDuplicateProject = () => {
    toast({ title: "Duplicating", description: "Creating a copy of this project..." })
    // In a real app, this would duplicate the project and redirect to the new one
    setTimeout(() => {
      router.push("/projects/new")
    }, 1000)
  }

  const handleShareProject = () => {
    navigator.clipboard.writeText(window.location.origin + `/projects/${projectId}`)
    toast({ title: "Link Copied", description: "Project link has been copied to clipboard." })
  }

  if (isLoading) {
    return (
      <>
        <Header />
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
        <Header />
        <div className="container mx-auto py-8 text-center">
          <p className="text-xl text-muted-foreground">Project not found.</p>
          <Button asChild className="mt-4">
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header pageTitle="Survey Complete" />

      <main className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircleIcon className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Survey Successfully Created!</h1>

          <p className="text-xl text-muted-foreground mb-8">
            Your survey has been exported and is ready to use. You can download it again or create a new project.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium text-lg">Market Research Survey</h2>
                <p className="text-muted-foreground">3 sections • 5 questions</p>
              </div>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download Again
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/projects")}>
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button className="flex-1" onClick={() => router.push("/projects/new")}>
            Create New Survey
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  )
}
