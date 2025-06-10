"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import WorkflowNavigation from "@/components/workflow-navigation"
import type { Project } from "@/types"
import { getProjectById } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeftIcon,
  EditIcon,
  FileTextIcon,
  ListOrderedIcon,
  CheckSquareIcon,
  Loader2Icon,
  Settings2Icon,
  BarChart3Icon,
  ClockIcon,
  UsersIcon,
  GlobeIcon,
  LanguagesIcon,
  BriefcaseIcon,
  Users2Icon,
  WorkflowIcon,
  DownloadIcon,
} from "lucide-react"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  const DetailItem = ({ icon: Icon, label, value }) => {
    if (!value && value !== 0) return null
    return (
      <div className="flex items-start">
        <Icon className="h-4 w-4 mr-2 mt-1 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{String(value)}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <>
        <Header title="Project Details" />
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

  const getStatusColorClass = (status: Project["status"]): string => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50"
      case "In Progress":
        return "text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50"
      case "Draft":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50"
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/50"
    }
  }

  return (
    <>
      <Header pageTitle="Project Setup" stepNumber={1} />
      <main className="container max-w-screen-xl mx-auto py-8 px-4 md:px-6 pb-24">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/projects">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Project Details & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">{project.project_name}</CardTitle>
                  <Badge className={`${getStatusColorClass(project.status)}`}>{project.status}</Badge>
                </div>
                <CardDescription>
                  Client: {project.client_name} | Project #: {project.project_number}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailItem icon={Settings2Icon} label="Methodology" value={project.methodology_name} />
                <DetailItem icon={BriefcaseIcon} label="Industry" value={project.industry_name} />
                <DetailItem icon={BarChart3Icon} label="Sample Size" value={project.sample_size} />
                <DetailItem icon={ClockIcon} label="Est. LOI" value={project.loi ? `${project.loi} min` : "N/A"} />
                <DetailItem icon={UsersIcon} label="Sample Type" value={project.sample_type} />
                <DetailItem icon={GlobeIcon} label="Target Country" value={project.target_country} />
                <DetailItem icon={LanguagesIcon} label="Language" value={project.language_preference?.toUpperCase()} />
                <DetailItem icon={Users2Icon} label="Addressable Market" value={project.addressable_market} />
                <DetailItem icon={WorkflowIcon} label="Streams" value={project.streams} />
                <DetailItem
                  icon={FileTextIcon}
                  label="Last Modified"
                  value={new Date(project.last_modified).toLocaleDateString()}
                />
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href={`/projects/${project.id}/edit`}>
                    <EditIcon className="mr-2 h-4 w-4" /> Edit Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {project.research_objectives && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Research Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{project.research_objectives}</p>
                </CardContent>
              </Card>
            )}

            {project.sample_profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sample Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{project.sample_profile}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Survey Workflow */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Survey Workflow</CardTitle>
                <CardDescription>Follow these steps to create your survey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="secondary" className="justify-start h-auto py-3 text-left">
                    <div className="flex items-center">
                      <FileTextIcon className="mr-3 h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">Project Setup</p>
                        <p className="text-xs text-muted-foreground">Configure project details</p>
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3 text-left" asChild>
                    <Link href={`/projects/${project.id}/sections`}>
                      <div className="flex items-center">
                        <FileTextIcon className="mr-3 h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium">Section Library</p>
                          <p className="text-xs text-muted-foreground">Select & customize survey sections</p>
                        </div>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3 text-left" asChild>
                    <Link href={`/projects/${project.id}/questions`}>
                      <div className="flex items-center">
                        <CheckSquareIcon className="mr-3 h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium">Question Review</p>
                          <p className="text-xs text-muted-foreground">AI suggestions & manual edits</p>
                        </div>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3 text-left" asChild>
                    <Link href={`/projects/${project.id}/order`}>
                      <div className="flex items-center">
                        <ListOrderedIcon className="mr-3 h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium">Section Order</p>
                          <p className="text-xs text-muted-foreground">Optimize survey flow</p>
                        </div>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3 text-left" asChild>
                    <Link href={`/projects/${project.id}/export`}>
                      <div className="flex items-center">
                        <DownloadIcon className="mr-3 h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium">Export & Review</p>
                          <p className="text-xs text-muted-foreground">Preview and export</p>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Project Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Project Setup</span>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      Completed
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Section Selection</span>
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    >
                      Not Started
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Question Review</span>
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    >
                      Not Started
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Section Order</span>
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    >
                      Not Started
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Export & Review</span>
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    >
                      Not Started
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Consistent Navigation */}
        <WorkflowNavigation
          projectId={projectId}
          currentStep="setup"
          showBack={false}
          nextButtonText="Continue to Section Library"
        />
      </main>
    </>
  )
}
