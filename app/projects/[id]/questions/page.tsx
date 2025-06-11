"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"
import WorkflowNavigation from "@/components/workflow-navigation"
import { getProjectById } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeftIcon,
  EditIcon,
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
  RefreshCwIcon,
  Loader2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  WandIcon,
} from "lucide-react"
import type { Project } from "@/types"

// Define types for questions and sections
interface QuestionOption {
  id: string
  text: string
  order: number
}

interface Question {
  id: string
  sectionId: string
  questionNumber: string
  text: string
  type: "single-choice" | "multiple-choice" | "open-text" | "likert-scale" | "rating" | "ranking"
  options?: QuestionOption[]
  isRequired: boolean
  isAiGenerated: boolean
  aiSuggestions?: string[]
  order: number
}

interface SurveySection {
  id: string
  name: string
  description: string
  type: "basic" | "prophecy" | "cx" | "choice"
  questions: Question[]
  isExpanded: boolean
}

// Mock data for demonstration
const mockSections: SurveySection[] = [
  {
    id: "screeners",
    name: "Screeners",
    description: "Essential screening questions to qualify respondents",
    type: "basic",
    isExpanded: true,
    questions: [
      {
        id: "q1",
        sectionId: "screeners",
        questionNumber: "S1",
        text: "What is your age?",
        type: "single-choice",
        options: [
          { id: "opt1", text: "18-24", order: 1 },
          { id: "opt2", text: "25-34", order: 2 },
          { id: "opt3", text: "35-44", order: 3 },
          { id: "opt4", text: "45-54", order: 4 },
          { id: "opt5", text: "55-64", order: 5 },
          { id: "opt6", text: "65+", order: 6 },
        ],
        isRequired: true,
        isAiGenerated: true,
        aiSuggestions: [
          "What age group do you belong to?",
          "Please select your age range:",
          "Which of the following age categories best describes you?",
        ],
        order: 1,
      },
      {
        id: "q2",
        sectionId: "screeners",
        questionNumber: "S2",
        text: "Do you currently use any social media platforms?",
        type: "single-choice",
        options: [
          { id: "opt7", text: "Yes, regularly (daily)", order: 1 },
          { id: "opt8", text: "Yes, occasionally (weekly)", order: 2 },
          { id: "opt9", text: "Rarely (monthly or less)", order: 3 },
          { id: "opt10", text: "No, I don't use social media", order: 4 },
        ],
        isRequired: true,
        isAiGenerated: true,
        aiSuggestions: [
          "How frequently do you use social media platforms?",
          "Which best describes your social media usage?",
          "Do you actively engage with social media?",
        ],
        order: 2,
      },
    ],
  },
  // More sections...
]

export default function QuestionReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sections, setSections] = useState<SurveySection[]>(mockSections)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState<string>("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<string | null>(null)
  const [manualEditMode, setManualEditMode] = useState<string | null>(null)

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

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) => (section.id === sectionId ? { ...section, isExpanded: !section.isExpanded } : section)),
    )
  }

  // Update question text
  const updateQuestionText = (questionId: string, newText: string) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        questions: section.questions.map((question) =>
          question.id === questionId ? { ...question, text: newText } : question,
        ),
      })),
    )
  }

  // Apply AI suggestion
  const applyAISuggestion = (questionId: string, suggestion: string) => {
    updateQuestionText(questionId, suggestion)
    setEditingQuestion(null)
    toast({ title: "Applied", description: "AI suggestion has been applied to the question." })
  }

  // Generate new AI suggestions
  const generateAISuggestions = async (questionId: string) => {
    setIsGeneratingAI(questionId)
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newSuggestions = [
      "How would you rate your experience with our product?",
      "What is your overall satisfaction level?",
      "Please evaluate your experience using the scale below:",
    ]

    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        questions: section.questions.map((question) =>
          question.id === questionId ? { ...question, aiSuggestions: newSuggestions } : question,
        ),
      })),
    )

    setIsGeneratingAI(null)
    toast({ title: "Generated", description: "New AI suggestions have been generated." })
  }

  // Submit feedback and regenerate with context
  const submitFeedbackAndRegenerate = async (questionId: string, feedback: string) => {
    setIsSubmittingFeedback(questionId)
    // Simulate AI regeneration with feedback
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const contextualSuggestions = [
      `Based on your feedback: "${feedback}" - How would you rate your experience with our product?`,
      `Incorporating your input: "${feedback}" - What is your overall satisfaction level?`,
      `Considering your feedback: "${feedback}" - Please evaluate your experience using the scale below:`,
    ]

    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        questions: section.questions.map((question) =>
          question.id === questionId ? { ...question, aiSuggestions: contextualSuggestions } : question,
        ),
      })),
    )

    setIsSubmittingFeedback(null)
    setFeedbackText("")
    toast({ title: "Regenerated", description: "New suggestions generated based on your feedback." })
  }

  // Toggle manual edit mode
  const toggleManualEditMode = (questionId: string) => {
    if (manualEditMode === questionId) {
      setManualEditMode(null)
    } else {
      setManualEditMode(questionId)
      setEditingQuestion(questionId) // Ensure editing question is also set
    }
  }

  // Reset all editing states
  const resetEditingStates = () => {
    setEditingQuestion(null)
    setManualEditMode(null)
    setFeedbackText("")
    setIsGeneratingAI(null)
    setIsSubmittingFeedback(null)
  }

  // Duplicate question
  const duplicateQuestion = (questionId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        const questionIndex = section.questions.findIndex((q) => q.id === questionId)
        if (questionIndex !== -1) {
          const originalQuestion = section.questions[questionIndex]
          const newQuestion: Question = {
            ...originalQuestion,
            id: `${originalQuestion.id}-copy`,
            questionNumber: `${originalQuestion.questionNumber}a`,
            text: `${originalQuestion.text} (Copy)`,
            options: originalQuestion.options?.map((opt) => ({
              ...opt,
              id: `${opt.id}-copy`,
            })),
          }
          const newQuestions = [...section.questions]
          newQuestions.splice(questionIndex + 1, 0, newQuestion)
          return { ...section, questions: newQuestions }
        }
        return section
      }),
    )
    toast({ title: "Duplicated", description: "Question has been duplicated." })
  }

  // Delete question
  const deleteQuestion = (questionId: string) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        questions: section.questions.filter((question) => question.id !== questionId),
      })),
    )
    toast({ title: "Deleted", description: "Question has been removed." })
  }

  // Add new question to section
  const addNewQuestion = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const newQuestionNumber = `Q${section.questions.length + 1}`
    const newQuestion: Question = {
      id: `${sectionId}-new-${Date.now()}`,
      sectionId,
      questionNumber: newQuestionNumber,
      text: "Enter your question here...",
      type: "single-choice",
      options: [
        { id: `new-opt1-${Date.now()}`, text: "Option 1", order: 1 },
        { id: `new-opt2-${Date.now()}`, text: "Option 2", order: 2 },
      ],
      isRequired: true,
      isAiGenerated: false,
      order: section.questions.length + 1,
    }

    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, questions: [...s.questions, newQuestion] } : s)),
    )

    setEditingQuestion(newQuestion.id)
    toast({ title: "Added", description: "New question has been added to the section." })
  }

  // Handle continue to next step
  const handleContinue = async () => {
    // In a real app, you would save the questions to the project
    console.log("Questions saved:", sections)
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
      <Header pageTitle="Question Review" stepNumber={3} />
      <main className="container max-w-screen-xl mx-auto py-8 px-4 md:px-6 pb-24">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Question Review</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Review and customize AI-generated questions for your survey sections. Edit questions, modify options, and
            ensure they align with your research objectives.
          </p>
        </div>

        {/* Sections and Questions */}
        <div className="space-y-6 mb-12">
          {sections.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      {section.isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.name}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={
                        section.type === "basic"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
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
                    <Badge variant="secondary">{section.questions.length} questions</Badge>
                  </div>
                </div>
              </CardHeader>

              {section.isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {section.questions.map((question) => (
                      <div key={question.id} className="border rounded-lg p-6 bg-muted/20">
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="font-mono">
                              {question.questionNumber}
                            </Badge>
                            {question.isAiGenerated && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                <SparklesIcon className="h-3 w-3 mr-1" />
                                AI Generated
                              </Badge>
                            )}
                            {question.isRequired && (
                              <Badge variant="outline" className="bg-red-100 text-red-700">
                                Required
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingQuestion(editingQuestion === question.id ? null : question.id)}
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => duplicateQuestion(question.id)}>
                              <CopyIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Question Text */}
                        {editingQuestion === question.id ? (
                          <div className="space-y-4">
                            {manualEditMode === question.id ? (
                              // Simple Manual Edit Mode
                              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                                <div>
                                  <Label>Manual Edit - Free Text</Label>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Edit the question freely. Our AI will help structure it when you save.
                                  </p>
                                  <Textarea
                                    placeholder="Enter your question and any answer options here..."
                                    rows={6}
                                    className="mt-2"
                                    defaultValue={
                                      question.text +
                                      (question.options
                                        ? "\n\nOptions:\n" + question.options.map((opt) => `• ${opt.text}`).join("\n")
                                        : "")
                                    }
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setManualEditMode(null)
                                      setEditingQuestion(question.id) // Keep in editing mode but switch to AI suggestions
                                    }}
                                  >
                                    Switch to AI Suggestions
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      toast({ title: "Saved", description: "Manual edits have been applied." })
                                      setManualEditMode(null)
                                      setEditingQuestion(null)
                                    }}
                                  >
                                    Apply Changes
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // AI Suggestions Mode (make this more prominent)
                              <div className="space-y-4">
                                {/* Encouraging header for AI suggestions */}
                                <div className="p-4 border rounded-lg bg-blue-50/50 border-blue-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="flex items-center text-lg font-semibold">
                                      <WandIcon className="h-5 w-5 mr-2 text-blue-600" />
                                      AI Question Assistant
                                    </Label>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => generateAISuggestions(question.id)}
                                      disabled={isGeneratingAI === question.id}
                                    >
                                      {isGeneratingAI === question.id ? (
                                        <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
                                      ) : (
                                        <RefreshCwIcon className="h-4 w-4 mr-1" />
                                      )}
                                      More Suggestions
                                    </Button>
                                  </div>
                                  <p className="text-sm text-blue-700 mb-3">
                                    Our AI generates contextually relevant questions. Your feedback helps us improve for
                                    everyone!
                                  </p>

                                  {question.aiSuggestions && (
                                    <div className="space-y-2 mb-4">
                                      <Label className="text-blue-900">Choose from AI suggestions:</Label>
                                      {question.aiSuggestions.map((suggestion, index) => (
                                        <div
                                          key={index}
                                          className="p-3 border border-blue-200 rounded-lg bg-white hover:bg-blue-50 cursor-pointer transition-colors"
                                          onClick={() => applyAISuggestion(question.id, suggestion)}
                                        >
                                          <p className="text-sm">{suggestion}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Enhanced Feedback Section */}
                                  <div className="space-y-3 p-4 border border-blue-300 rounded-lg bg-blue-25">
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-blue-900">
                                        💡 Help us improve our AI
                                      </span>
                                    </div>
                                    <Label className="text-blue-800">What would make this question better?</Label>
                                    <Textarea
                                      placeholder="e.g., 'Make it more conversational', 'Add industry-specific options', 'Focus on customer satisfaction'..."
                                      value={feedbackText}
                                      onChange={(e) => setFeedbackText(e.target.value)}
                                      rows={3}
                                      className="border-blue-200"
                                    />
                                    <Button
                                      onClick={() => submitFeedbackAndRegenerate(question.id, feedbackText)}
                                      disabled={!feedbackText.trim() || isSubmittingFeedback === question.id}
                                      size="sm"
                                      className="w-full"
                                    >
                                      {isSubmittingFeedback === question.id ? (
                                        <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
                                      ) : (
                                        <WandIcon className="h-4 w-4 mr-1" />
                                      )}
                                      Generate Better Suggestions
                                    </Button>
                                  </div>
                                </div>

                                {/* Manual edit as secondary option */}
                                <div className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleManualEditMode(question.id)}
                                    className="text-muted-foreground"
                                  >
                                    Or edit manually
                                  </Button>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={resetEditingStates}>
                                Cancel
                              </Button>
                              <Button onClick={resetEditingStates}>Save Changes</Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-medium mb-3">{question.text}</p>
                            {question.type !== "open-text" && question.options && (
                              <div className="space-y-1">
                                {question.options.map((option, index) => (
                                  <div key={option.id} className="flex items-center space-x-2 text-sm">
                                    <span className="text-muted-foreground">{index + 1}.</span>
                                    <span>{option.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-3 flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>
                                Type: {question.type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                              {question.options && <span>{question.options.length} options</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add New Question Button */}
                    <Button
                      variant="outline"
                      className="w-full py-6 border-dashed"
                      onClick={() => addNewQuestion(section.id)}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add New Question to {section.name}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Consistent Navigation */}
        <WorkflowNavigation projectId={projectId} currentStep="questions" onNext={handleContinue} />
      </main>
    </>
  )
}
