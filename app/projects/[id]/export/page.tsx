"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import WorkflowNavigation from "@/components/workflow-navigation"
import { getProjectById, getProjectSectionsDetailed, exportProject } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeftIcon,
  DownloadIcon,
  FileTextIcon,
  FileIcon,
  TableIcon,
  Loader2Icon,
  CheckCircleIcon,
} from "lucide-react"
import type { Project } from "@/types"
import ErrorHandler from "@/components/error-handler"

type ExportFormat = "docx" | "pdf" | "csv"

interface ExportOption {
  format: ExportFormat
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  fileExtension: string
  mimeType: string
}

const exportOptions: ExportOption[] = [
  {
    format: "docx",
    title: "Microsoft Word",
    description: "Export as a formatted Word document (.docx) for easy editing and sharing",
    icon: FileTextIcon,
    fileExtension: "docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  },
  {
    format: "pdf",
    title: "PDF Document",
    description: "Export as a PDF for professional presentation and printing",
    icon: FileIcon,
    fileExtension: "pdf",
    mimeType: "application/pdf"
  },
  {
    format: "csv",
    title: "CSV Spreadsheet",
    description: "Export as a CSV file for data analysis and import into other tools",
    icon: TableIcon,
    fileExtension: "csv",
    mimeType: "text/csv"
  }
]

export default function ExportPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [questionCount, setQuestionCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Fetch project data and question count
  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch project details and sections in parallel
        const [fetchedProject, sections] = await Promise.all([
          getProjectById(projectId),
          getProjectSectionsDetailed(projectId)
        ])
        
        if (fetchedProject) {
          setProject(fetchedProject)
          
          // Count total questions across all sections
          const totalQuestions = sections.reduce((count, section) => {
            return count + (section.questions ? section.questions.length : 0)
          }, 0)
          
          setQuestionCount(totalQuestions)
          
          console.log(`✅ Export page loaded: ${totalQuestions} questions across ${sections.length} sections`)
        } else {
          setError(new Error("Project not found"))
        }
      } catch (error) {
        console.error("Failed to fetch project data:", error)
        setError(error as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  // Handle export
  const handleExport = async (format: ExportFormat) => {
    if (exportingFormat) {
      toast({
        title: "Export in Progress",
        description: "Please wait for the current export to complete before starting another.",
        variant: "destructive",
      })
      return
    }

    setExportingFormat(format)
    try {
      const blob = await exportProject(projectId, format)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const option = exportOptions.find(opt => opt.format === format)!
      const fileName = `${project?.project_name || 'survey'}_${project?.project_number || 'export'}.${option.fileExtension}`
      link.download = fileName
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Export Successful",
        description: `Your survey has been exported as ${option.title}.`,
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export the survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExportingFormat(null)
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

  if (error) {
    return (
      <>
        <Header pageTitle="Export Survey" stepNumber={4} />
        <div className="container mx-auto py-8">
          <ErrorHandler 
            error={error}
            onRetry={() => window.location.reload()}
            onStartOver={() => router.push("/projects")}
          />
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

  return (
    <>
      <Header pageTitle="Export Survey" stepNumber={4} />
      <main className="container max-w-screen-lg mx-auto py-8 px-4 md:px-6 pb-24">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold tracking-tight">Survey Complete!</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your survey "{project.project_name}" has been successfully created. Choose your preferred export format below.
          </p>
        </div>

        {/* Project Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Summary</CardTitle>
            <CardDescription>Overview of your completed survey project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                <p className="text-lg">{project.project_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client</p>
                <p className="text-lg">{project.client_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Methodology</p>
                <p className="text-lg">{project.methodology_name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry</p>
                <p className="text-lg">{project.industry_name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Questions</p>
                <p className="text-lg">{questionCount} questions</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  Complete
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold text-center">Choose Export Format</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exportOptions.map((option) => {
              const Icon = option.icon
              const isExporting = exportingFormat === option.format
              const isDisabled = exportingFormat !== null && !isExporting

              return (
                <Card 
                  key={option.format} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isExporting ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => !isDisabled && handleExport(option.format)}
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      {isExporting ? (
                        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
                      ) : (
                        <Icon className="h-12 w-12 text-primary" />
                      )}
                    </div>
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                    <CardDescription className="text-center">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      className="w-full" 
                      disabled={isDisabled}
                      variant={isExporting ? "secondary" : "default"}
                    >
                      {isExporting ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Export as {option.fileExtension.toUpperCase()}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/questions`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Questions
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/projects">
              View All Projects
            </Link>
          </Button>
        </div>
      </main>

      <WorkflowNavigation 
        currentStep="export"
        projectId={projectId}
        onNext={async () => {
          router.push("/projects")
          return true
        }}
        nextButtonText="Back to Dashboard"
      />
    </>
  )
}
