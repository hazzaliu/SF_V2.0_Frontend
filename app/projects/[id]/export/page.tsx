"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"
import WorkflowNavigation from "@/components/workflow-navigation"
import { getProjectById, generateSurveyDocument } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeftIcon, Loader2Icon, Download, Edit, Save, X, MessageSquare, Eye } from "lucide-react"
import type { Project } from "@/types"

// Mock data for sections and questions
const MOCK_SURVEY = [
  {
    id: "s1",
    name: "Introduction",
    questions: [
      {
        id: "q1",
        text: "Welcome to our survey. This research aims to understand customer preferences and experiences with our products.",
        type: "text",
      },
    ],
  },
  {
    id: "s2",
    name: "Screener Questions",
    questions: [
      {
        id: "q2",
        text: "Have you purchased any of our products in the last 6 months?",
        type: "single-choice",
        options: ["Yes", "No", "Not sure"],
      },
      {
        id: "q3",
        text: "Which of the following product categories are you most interested in?",
        type: "multiple-choice",
        options: ["Electronics", "Clothing", "Home & Garden", "Sports & Outdoors", "Books & Media"],
      },
    ],
  },
  {
    id: "s3",
    name: "Product Preferences",
    questions: [
      {
        id: "q4",
        text: "When choosing between similar products, which factor is most important to you?",
        type: "single-choice",
        options: ["Price", "Quality", "Brand reputation", "Customer reviews", "Features"],
      },
      {
        id: "q5",
        text: "How important is price in your purchasing decisions?",
        type: "likert-scale",
        options: [
          "Extremely important",
          "Very important",
          "Moderately important",
          "Slightly important",
          "Not important at all",
        ],
      },
    ],
  },
]

export default function ExportPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [survey, setSurvey] = useState(MOCK_SURVEY)
  const [exportFormat, setExportFormat] = useState("docx")
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editedText, setEditedText] = useState("")
  const [isManualEdit, setIsManualEdit] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [includeOptions, setIncludeOptions] = useState({
    introduction: true,
    numbering: true,
    metadata: true,
  })

  // Fetch project data
  const fetchProject = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedProject = await getProjectById(projectId)
      if (fetchedProject) {
        setProject(fetchedProject)
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" })
        router.push("/projects")
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

  const handleEditQuestion = (questionId: string) => {
    const question = survey.flatMap((s) => s.questions).find((q) => q.id === questionId)
    if (question) {
      setEditingQuestionId(questionId)
      setEditedText(question.text)
      setIsManualEdit(false)
    }
  }

  const handleSaveQuestion = (questionId: string) => {
    setSurvey((prev) =>
      prev.map((section) => ({
        ...section,
        questions: section.questions.map((q) => (q.id === questionId ? { ...q, text: editedText } : q)),
      })),
    )
    resetEditingStates()
    toast({ title: "Saved", description: "Question has been updated." })
  }

  const handleCancelEdit = () => {
    resetEditingStates()
  }

  const toggleManualEditMode = () => {
    setIsManualEdit(!isManualEdit)
  }

  const resetEditingStates = () => {
    setEditingQuestionId(null)
    setEditedText("")
    setIsManualEdit(false)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await generateSurveyDocument(projectId, exportFormat as "docx" | "pdf" | "csv")

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `survey-${projectId}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({ title: "Success", description: `Survey exported as ${exportFormat.toUpperCase()}` })

      // Navigate to finished page
      router.push(`/projects/${projectId}/finished`)
      return true
    } catch (error) {
      console.error("Export failed:", error)
      toast({ title: "Error", description: "Failed to export survey. Please try again.", variant: "destructive" })
      return false
    } finally {
      setIsExporting(false)
    }
  }

  const applySuggestion = (suggestion: string) => {
    setEditedText(suggestion)
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
      <Header pageTitle="Export & Review" stepNumber={5} />
      <main className="container max-w-screen-xl mx-auto py-8 px-4 md:px-6 pb-24">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Export & Review</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Review your survey one final time and export it in your preferred format.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Survey Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  Survey Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {survey.map((section) => (
                    <div key={section.id} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-medium">{section.name}</h3>
                        <Badge variant="outline">{section.questions.length} questions</Badge>
                      </div>
                      <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                        {section.questions.map((question, index) => (
                          <div key={question.id} className="space-y-2">
                            {editingQuestionId === question.id ? (
                              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                {isManualEdit ? (
                                  <div className="space-y-3">
                                    <label className="text-sm font-medium">Edit Question</label>
                                    <Textarea
                                      value={editedText}
                                      onChange={(e) => setEditedText(e.target.value)}
                                      rows={4}
                                      className="w-full"
                                      placeholder="Edit your question here..."
                                    />
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="p-3 border rounded-md bg-background">
                                      <p className="font-medium">Current Question:</p>
                                      <p className="mt-1">{editedText}</p>
                                    </div>
                                    <div className="space-y-3">
                                      <h4 className="font-medium flex items-center">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        AI Suggestions
                                      </h4>
                                      <div
                                        className="p-3 border rounded-md hover:border-primary/50 cursor-pointer transition-all"
                                        onClick={() =>
                                          applySuggestion(
                                            "How would you rate your satisfaction with our product on a scale from 1 to 10?",
                                          )
                                        }
                                      >
                                        How would you rate your satisfaction with our product on a scale from 1 to 10?
                                      </div>
                                      <div
                                        className="p-3 border rounded-md hover:border-primary/50 cursor-pointer transition-all"
                                        onClick={() =>
                                          applySuggestion(
                                            "On a scale of 1-10, please indicate your level of satisfaction with our product.",
                                          )
                                        }
                                      >
                                        On a scale of 1-10, please indicate your level of satisfaction with our product.
                                      </div>
                                      <div
                                        className="p-3 border rounded-md hover:border-primary/50 cursor-pointer transition-all"
                                        onClick={() =>
                                          applySuggestion(
                                            "Please rate how satisfied you are with our product using the scale below.",
                                          )
                                        }
                                      >
                                        Please rate how satisfied you are with our product using the scale below.
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-between">
                                  <Button variant="outline" size="sm" onClick={toggleManualEditMode}>
                                    {isManualEdit ? (
                                      <>
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Show AI Suggestions
                                      </>
                                    ) : (
                                      <>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Manual Edit
                                      </>
                                    )}
                                  </Button>
                                  <div className="space-x-2">
                                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                      <X className="h-4 w-4 mr-2" />
                                      Cancel
                                    </Button>
                                    <Button size="sm" onClick={() => handleSaveQuestion(question.id)}>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start group">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      Q{index + 1}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {question.type.replace("-", " ")}
                                    </Badge>
                                  </div>
                                  <p className="text-sm">{question.text}</p>
                                  {question.options && (
                                    <div className="mt-2 space-y-1">
                                      {question.options.map((option, optIndex) => (
                                        <div
                                          key={optIndex}
                                          className="flex items-center space-x-2 text-xs text-muted-foreground"
                                        >
                                          <span>{optIndex + 1}.</span>
                                          <span>{option}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditQuestion(question.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Format</h3>
                    <Tabs value={exportFormat} onValueChange={setExportFormat}>
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="docx">DOCX</TabsTrigger>
                        <TabsTrigger value="pdf">PDF</TabsTrigger>
                        <TabsTrigger value="csv">CSV</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Include</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include-intro"
                          checked={includeOptions.introduction}
                          onChange={(e) => setIncludeOptions((prev) => ({ ...prev, introduction: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="include-intro" className="text-sm">
                          Introduction
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include-numbering"
                          checked={includeOptions.numbering}
                          onChange={(e) => setIncludeOptions((prev) => ({ ...prev, numbering: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="include-numbering" className="text-sm">
                          Question Numbering
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include-metadata"
                          checked={includeOptions.metadata}
                          onChange={(e) => setIncludeOptions((prev) => ({ ...prev, metadata: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="include-metadata" className="text-sm">
                          Section Metadata
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <span>Total Sections:</span>
                        <span>{survey.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Questions:</span>
                        <span>{survey.reduce((acc, section) => acc + section.questions.length, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Duration:</span>
                        <span>5-7 minutes</span>
                      </div>
                    </div>

                    <Button className="w-full" onClick={handleExport} disabled={isExporting}>
                      {isExporting ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Export Survey
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Consistent Navigation */}
        <WorkflowNavigation
          projectId={projectId}
          currentStep="export"
          onNext={handleExport}
          disableNext={isExporting}
          nextButtonText={isExporting ? "Exporting..." : "Export Survey"}
        />
      </main>
    </>
  )
}
