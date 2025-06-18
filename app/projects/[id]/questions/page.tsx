"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"
import WorkflowNavigation from "@/components/workflow-navigation"
import { getProjectById, getProjectSectionsDetailed, generateAIQuestions, repromptQuestions, getQuestionRepromptOptions, saveProjectQuestions, updateProjectStatus, exportProject as apiExportProject, GeneratedQuestion, QuestionRepromptOption, ProjectSection, getUserSessionId } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw, ChevronDown, ChevronUp, Sparkles, FileText, Edit, Trash2, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Types for backend data
interface BackendSection {
  id: string
  name: string
  description: string
  section_type: string
  static_content?: any // Allow any structure since backend varies
}

interface ProcessedSection extends ProjectSection {
  questions: GeneratedQuestion[]
  isGenerating: boolean
  generationError?: string
  isExpanded: boolean
}

// Streamlined Generated Question Card Component
function GeneratedQuestionCard({
  question,
  qIndex,
  isDriverSection,
  sectionName,
  editingQuestion,
  setEditingQuestion,
  editedText,
  setEditedText,
  rewriteExpanded,
  setRewriteExpanded,
  rewriteFeedback,
  setRewriteFeedback,
  onSaveEdit,
  onDelete,
  onRewrite,
  isSubmittingFeedback,
  editedQuestions,
  rewrittenQuestions
}: {
  question: GeneratedQuestion
  qIndex: number
  isDriverSection: boolean
  sectionName: string
  editingQuestion: string | null
  setEditingQuestion: (id: string | null) => void
  editedText: string
  setEditedText: (text: string) => void
  rewriteExpanded: string | null
  setRewriteExpanded: (id: string | null) => void
  rewriteFeedback: Record<string, string>
  setRewriteFeedback: React.Dispatch<React.SetStateAction<Record<string, string>>>
  onSaveEdit: () => void
  onDelete: () => void
  onRewrite: (feedbackText?: string) => void
  isSubmittingFeedback: boolean
  editedQuestions: string[]
  rewrittenQuestions: string[]
}) {
  const isEditing = editingQuestion === question.id
  const isRewriteExpanded = rewriteExpanded === question.id
  
  // Local state for feedback input to avoid updating parent on every keystroke
  const [localFeedback, setLocalFeedback] = useState(rewriteFeedback[question.id] || "")
  
  // Update local feedback when the question changes or when rewrite section expands
  useEffect(() => {
    if (isRewriteExpanded) {
      setLocalFeedback(rewriteFeedback[question.id] || "")
    }
  }, [isRewriteExpanded, rewriteFeedback, question.id])
  
  // Handle rewrite with feedback - only save feedback when actually submitting
  const handleRewriteClick = () => {
    // Save the feedback to parent state only when clicking rewrite
    setRewriteFeedback(prev => ({ ...prev, [question.id]: localFeedback }))
    // Pass the feedback directly to avoid async state issues
    onRewrite(localFeedback)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        {/* Question Text */}
        <div className="flex-1 mr-3">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={onSaveEdit}
                  className="h-7 px-2 text-xs"
                >
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                  className="h-7 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-900 leading-relaxed">
              {(() => {
                const isAttitudinalSection = sectionName.toLowerCase().includes('attitudinal')
                if (isDriverSection) {
                  return `D${qIndex + 1}: ${question.text}`
                } else if (isAttitudinalSection) {
                  return question.text // Attitudinal statements don't need Q numbering
                } else {
                  return `Q${qIndex + 1}: ${question.text}`
                }
              })()}
            </p>
          )}
          
          {/* Status Badges */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {editedQuestions.includes(question.id) && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Edit className="h-3 w-3 mr-1" />
                Edited
              </Badge>
            )}
            {rewrittenQuestions.includes(question.id) && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Rewritten
              </Badge>
            )}
            {rewriteFeedback[question.id] && rewriteFeedback[question.id].trim() && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                💬 Feedback: "{rewriteFeedback[question.id].substring(0, 30)}{rewriteFeedback[question.id].length > 30 ? '...' : ''}"
              </Badge>
            )}
          </div>
          
          {/* Scale info for drivers and attitudinals */}
          {isDriverSection && question.scale_min !== undefined && question.scale_max !== undefined && (
            <p className="text-xs text-blue-600 mt-1">
              {question.scale_min}-{question.scale_max} scale
            </p>
          )}
          {sectionName.toLowerCase().includes('attitudinal') && (
            <p className="text-xs text-purple-600 mt-1">
              0-10 agreement scale (0 = Completely disagree, 10 = Completely agree)
            </p>
          )}
          
          {/* Question Options */}
          {!isDriverSection && question.options && question.options.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Answer Options:</p>
              <div className="flex flex-wrap gap-1">
                {question.options.map((option, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setRewriteExpanded(isRewriteExpanded ? null : question.id)
              setRewriteFeedback(prev => ({ ...prev, [question.id]: prev[question.id] || "" }))
            }}
            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
            disabled={isSubmittingFeedback}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Rewrite
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingQuestion(question.id)
              setEditedText(question.text)
            }}
            className="h-7 px-2 text-xs text-gray-600 hover:text-gray-700"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Rewrite Feedback Expansion */}
      {isRewriteExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <Label className="text-xs font-medium text-gray-700">
            Provide feedback for rewriting:
          </Label>
          <Textarea
            value={localFeedback}
            onChange={(e) => setLocalFeedback(e.target.value)}
            placeholder={isDriverSection 
              ? "e.g., Make this driver more specific, focus on different attributes..."
              : "e.g., Make it more specific, change the tone, add more options..."
            }
            className="text-xs resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleRewriteClick}
              disabled={isSubmittingFeedback}
              className="h-7 px-2 text-xs"
            >
              {isSubmittingFeedback ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Rewriting...
                </>
              ) : (
                "Rewrite with AI"
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRewriteExpanded(null)}
              className="h-7 px-2 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Sortable Section Component
function SortableSection({ 
  section, 
  toggleSection, 
  renderStaticContent, 
  editingSection, 
  setEditingSection, 
  openRewriteModal,
  generateQuestionsForSection,
  feedbackText,
  setFeedbackText,
  selectedRepromptOption,
  setSelectedRepromptOption,
  repromptOptions,
  submitFeedbackAndRegenerate,
  isSubmittingFeedback,
  editingQuestion,
  setEditingQuestion,
  editedText,
  setEditedText,
  rewriteExpanded,
  setRewriteExpanded,
  rewriteFeedback,
  setRewriteFeedback,
  handleSaveEdit,
  handleDeleteQuestion,
  handleRewriteWithFeedback,
  editedQuestions,
  rewrittenQuestions
}: {
  section: ProcessedSection
  toggleSection: (id: string) => void
  renderStaticContent: (content: any) => React.ReactNode
  editingSection: string | null
  setEditingSection: (id: string | null) => void
  openRewriteModal: (id: string) => void
  generateQuestionsForSection: (id: string, name: string) => void
  feedbackText: Record<string, string>
  setFeedbackText: React.Dispatch<React.SetStateAction<Record<string, string>>>
  selectedRepromptOption: string
  setSelectedRepromptOption: (option: string) => void
  repromptOptions: QuestionRepromptOption[]
  submitFeedbackAndRegenerate: (questionId: string, feedback: string) => void
  isSubmittingFeedback: string | null
  editingQuestion: string | null
  setEditingQuestion: (id: string | null) => void
  editedText: string
  setEditedText: (text: string) => void
  rewriteExpanded: string | null
  setRewriteExpanded: (id: string | null) => void
  rewriteFeedback: Record<string, string>
  setRewriteFeedback: React.Dispatch<React.SetStateAction<Record<string, string>>>
  handleSaveEdit: (questionId: string) => void
  handleDeleteQuestion: (questionId: string) => void
  handleRewriteWithFeedback: (questionId: string, feedbackText?: string) => void
  editedQuestions: string[]
  rewrittenQuestions: string[]
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => toggleSection(section.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="cursor-grab active:cursor-grabbing p-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <CardTitle className="text-lg">{section.name}</CardTitle>
            {section.questions.length > 0 && (
              <Badge variant="default">
                <Sparkles className="h-3 w-3 mr-1" />
                {section.questions.length} Questions
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {section.isGenerating && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
            {section.isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>

      {section.isExpanded && (
        <CardContent className="space-y-6">
          {/* Static Content */}
          {section.static_content && section.is_static && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Static Content
                </h4>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                {renderStaticContent(section.static_content)}
              </div>
            </div>
          )}


          {/* Generation Error */}
          {section.generationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{section.generationError}</p>
              <Button 
                onClick={async () => {
                  try {
                    await generateQuestionsForSection(section.id, section.name, true)
                  } catch (error) {
                    console.error('Error retrying generation:', error)
                  }
                }}
                variant="outline" 
                size="sm" 
                className="mt-2"
                disabled={section.isGenerating}
              >
                {section.isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry Generation
                  </>
                )}
              </Button>
            </div>
          )}

          {/* AI Generated Content */}
          {section.questions.length > 0 && (() => {
            const isDriverSection = ['performance', 'price', 'reputation'].some(type => 
              section.name.toLowerCase().includes(type)
            )
            
            return (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                  {isDriverSection 
                    ? `${section.name} Drivers (${section.questions.length})`
                    : `AI Generated (${section.questions.length})`
                  }
                </h4>
                <div className="space-y-2">
                  {section.questions.map((question, qIndex) => (
                    <GeneratedQuestionCard
                      key={question.id}
                      question={question}
                      qIndex={qIndex}
                      isDriverSection={isDriverSection}
                      sectionName={section.name}
                      editingQuestion={editingQuestion}
                      setEditingQuestion={setEditingQuestion}
                      editedText={editedText}
                      setEditedText={setEditedText}
                      rewriteExpanded={rewriteExpanded}
                      setRewriteExpanded={setRewriteExpanded}
                      rewriteFeedback={rewriteFeedback}
                      setRewriteFeedback={setRewriteFeedback}
                      onSaveEdit={() => handleSaveEdit(question.id)}
                      onDelete={() => handleDeleteQuestion(question.id)}
                      onRewrite={(feedbackText) => handleRewriteWithFeedback(question.id, feedbackText)}
                      isSubmittingFeedback={isSubmittingFeedback === question.id}
                      editedQuestions={editedQuestions}
                      rewrittenQuestions={rewrittenQuestions}
                    />
                  ))}
                </div>
              </div>
            )
          })()}

          {/* No Content Generated Yet */}
          {section.questions.length === 0 && !section.isGenerating && !section.generationError && section.section_type !== 'static' && (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="mb-4">
                {['performance', 'price', 'reputation'].some(type => section.name.toLowerCase().includes(type))
                  ? `No ${section.name.includes('Performance') ? 'performance drivers' : section.name.includes('Price') ? 'price drivers' : section.name.includes('Reputation') ? 'reputation drivers' : 'drivers'} generated yet for this section.`
                  : 'No questions generated yet for this section.'
                }
              </p>
              <Button 
                onClick={async () => {
                  try {
                    await generateQuestionsForSection(section.id, section.name, true)
                  } catch (error) {
                    console.error('Error generating questions for section:', error)
                  }
                }}
                variant="outline" 
                size="sm"
                disabled={section.isGenerating}
              >
                {section.isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate {['performance', 'price', 'reputation'].some(type => section.name.toLowerCase().includes(type)) ? 'Drivers' : 'Questions'} for This Section
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function QuestionReviewPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const projectId = params.id as string
  const selectedSectionIds = useMemo(() => 
    searchParams.get('selected_sections')?.split(',') || [], 
    [searchParams]
  )
  
  const [project, setProject] = useState<any>(null)
  const [sections, setSections] = useState<ProcessedSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<string>("")
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({})
  const [selectedRepromptOption, setSelectedRepromptOption] = useState<string>("")
  const [repromptOptions, setRepromptOptions] = useState<QuestionRepromptOption[]>([])
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  
  // New streamlined states for generated question cards
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [editedText, setEditedText] = useState<string>("")
  const [rewriteExpanded, setRewriteExpanded] = useState<string | null>(null)
  const [rewriteFeedback, setRewriteFeedback] = useState<Record<string, string>>({})
  const [editedQuestions, setEditedQuestions] = useState<string[]>([])
  const [rewrittenQuestions, setRewrittenQuestions] = useState<string[]>([])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  // Generate questions for a specific section using OpenAI
  const generateQuestionsForSection = useCallback(async (sectionId: string, sectionName: string, refreshAfter: boolean = false): Promise<GeneratedQuestion[]> => {
    try {
      console.log(`🤖 Generating questions for section: ${sectionName} (${sectionId})`)
      
      const questionsBySection = await generateAIQuestions({
        project_id: projectId,
        sections: [sectionId],
        max_questions_per_section: 10
      })
      
      const questions = questionsBySection[sectionId] || []
      console.log(`✅ Generated ${questions.length} questions for ${sectionName}`)
      
      // If refreshAfter is true, refresh the section data from backend
      if (refreshAfter && questions.length > 0) {
        console.log('🔄 Refreshing section data from backend after individual generation...')
        const refreshedSections = await getProjectSectionsDetailed(projectId)
        
        // Filter to only selected sections, or use all sections if none specifically selected
        const selectedSections = selectedSectionIds.length > 0 
          ? refreshedSections.filter(section => selectedSectionIds.includes(section.id))
          : refreshedSections
        
        // Process sections - now with fresh data from backend
        const processedSections = selectedSections.map(section => ({
          ...section,
          questions: section.questions || [],
          isGenerating: false,
          isExpanded: true
        }))
        
        setSections(processedSections)
        console.log('✅ Refreshed section data from backend after individual generation')
      }
      
      return questions
    } catch (error) {
      console.error(`❌ Error generating questions for ${sectionName}:`, error)
      throw error
    }
  }, [projectId, selectedSectionIds])

  // Generate questions for all sections
  const generateAllQuestions = useCallback(async () => {
    if (!sections.length) return
    
    setIsGeneratingAll(true)
    
    try {
      const updatedSections = [...sections]
      let hasGeneratedNewQuestions = false
      
      // Generate questions for each section that doesn't have them yet
      for (let i = 0; i < updatedSections.length; i++) {
        const section = updatedSections[i]
        
        // Skip if already has questions or is static-only
        if (section.questions.length > 0 || section.section_type === 'static') {
          continue
        }
        
        // Mark as generating
        updatedSections[i] = { ...section, isGenerating: true, generationError: undefined }
        setSections([...updatedSections])
        
        try {
          const questions = await generateQuestionsForSection(section.id, section.name)
          updatedSections[i] = { 
            ...updatedSections[i], 
            questions, 
            isGenerating: false,
            generationError: undefined
          }
          hasGeneratedNewQuestions = true
        } catch (error) {
          updatedSections[i] = { 
            ...updatedSections[i], 
            isGenerating: false,
            generationError: `Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
        
        setSections([...updatedSections])
      }
      
      // Refresh data from backend to get the actual saved questions with correct IDs
      if (hasGeneratedNewQuestions) {
        console.log('🔄 Refreshing sections data from backend to get saved questions...')
        const refreshedSections = await getProjectSectionsDetailed(projectId)
        
        // Filter to only selected sections, or use all sections if none specifically selected
        const selectedSections = selectedSectionIds.length > 0 
          ? refreshedSections.filter(section => selectedSectionIds.includes(section.id))
          : refreshedSections
        
        // Process sections - now with fresh data from backend
        const processedSections = selectedSections.map(section => ({
          ...section,
          questions: section.questions || [],
          isGenerating: false,
          isExpanded: true
        }))
        
        setSections(processedSections)
        console.log('✅ Refreshed sections data from backend')
      }
      
      toast({ title: "Success", description: "Question generation completed!" })
    } catch (error) {
      console.error('Error in generateAllQuestions:', error)
      toast({ title: "Error", description: "Failed to generate questions.", variant: "destructive" })
    } finally {
      setIsGeneratingAll(false)
    }
  }, [sections, generateQuestionsForSection, toast, projectId, selectedSectionIds])

  // Process static content for display
  const processStaticContent = useCallback((staticContent: any): string => {
    if (!staticContent) {
      return ''
    }
    
    if (typeof staticContent === 'string') {
      return staticContent
    }
    
    if (Array.isArray(staticContent)) {
      let content = ''
      staticContent.forEach((sub: any) => {
        if (sub.name) {
          content += `${sub.name}\n`
        }
        if (sub.description) {
          content += `${sub.description}\n`
        }
        if (sub.questions && sub.questions.length > 0) {
          content += `${sub.questions.length} questions\n`
        }
        content += '\n'
      })
      return content
    }
    
    if (staticContent.type === 'composite' && staticContent.subsections) {
      let content = staticContent.title ? `${staticContent.title}\n\n` : ''
      content += staticContent.subsections.map((sub: any) => 
        `${sub.title}\n${sub.content || sub.description || ''}`
      ).join('\n\n')
      return content
    }
    
    if (staticContent.content) {
      return staticContent.content
    }
    
    return JSON.stringify(staticContent, null, 2)
  }, [])

  // Save all questions
  const saveAllQuestions = useCallback(async () => {
    try {
      const questionsData = sections.map(section => ({
        id: section.id,
        custom_title: section.name,
        questions: section.questions.map(q => ({
          id: q.id,
          question_text: q.text,
          question_type: q.type,
          position: q.position,
          is_required: q.is_required || false,
          options: q.options || []
        }))
      }))
      
      await saveProjectQuestions(projectId, questionsData)
      toast({ title: "Success", description: "All questions saved successfully!" })
    } catch (error) {
      console.error('Save error:', error)
      toast({ title: "Error", description: "Failed to save questions.", variant: "destructive" })
      throw error // Re-throw to prevent export if save fails
    }
  }, [projectId, sections, toast])

  // Export project as DOCX
  const exportSurvey = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // First save all questions if needed
      await saveAllQuestions()
      
      // Then export as DOCX using the API function
      const blob = await apiExportProject(projectId, 'docx')
      
      // Create filename and download
      const filename = `survey_export_${projectId.slice(0, 8)}.docx`
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({ title: "Success", description: "Survey exported successfully!" })
    } catch (error) {
      console.error('Export error:', error)
      toast({ title: "Error", description: "Failed to export survey.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [projectId, saveAllQuestions, toast])

  // Streamlined handlers for generated question cards
  const handleSaveEdit = useCallback(async (questionId: string) => {
    try {
      // Update the local state
      setSections(prev => prev.map(section => ({
        ...section,
        questions: section.questions.map(q => 
          q.id === questionId ? { ...q, text: editedText } : q
        )
      })))
      
      // Mark question as edited
      setEditedQuestions(prev => prev.includes(questionId) ? prev : [...prev, questionId])
      
      setEditingQuestion(null)
      setEditedText("")
      
      // Save the updated questions to backend
      await saveAllQuestions()
      toast({ title: "Success", description: "Question updated and saved!" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update question.", variant: "destructive" })
    }
  }, [editedText, toast, saveAllQuestions])

  const handleDeleteQuestion = useCallback(async (questionId: string) => {
    try {
      // Here you would call an API to delete the question
      // For now, just update the local state
      setSections(prev => prev.map(section => ({
        ...section,
        questions: section.questions.filter(q => q.id !== questionId)
      })))
      
      toast({ title: "Success", description: "Question deleted successfully!" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete question.", variant: "destructive" })
    }
  }, [toast])

  const handleRewriteWithFeedback = useCallback(async (questionId: string, feedbackText?: string) => {
    try {
      setIsSubmittingFeedback(questionId)
      
      // Find the current question and its section
      let currentQuestion: GeneratedQuestion | undefined
      let currentSection: ProcessedSection | undefined
      
      for (const section of sections) {
        const question = section.questions.find(q => q.id === questionId)
        if (question) {
          currentQuestion = question
          currentSection = section
          break
        }
      }
      
      if (!currentQuestion || !currentSection) {
        console.error('Question or section not found')
        setIsSubmittingFeedback("")
        return
      }
      
      // Use provided feedback or fall back to stored feedback
      const feedback = feedbackText || rewriteFeedback[questionId] || ""
      
      if (!feedback.trim()) {
        toast({ title: "Error", description: "Please provide feedback before rewriting.", variant: "destructive" })
        setIsSubmittingFeedback("")
        return
      }
      
      // Use the reprompt API with 'custom' option and feedback
      const repromptResult = await repromptQuestions({
        original_questions: [currentQuestion],
        reprompt_option: 'custom',
        section_id: currentSection.id,
        project_id: projectId,
        custom_feedback: feedback
      })
      
      if (repromptResult && repromptResult.length > 0) {
        const newQuestion = repromptResult[0]
        
        // Update the specific question in sections
        setSections(prev => prev.map(section => ({
          ...section,
          questions: section.questions.map(q => 
            q.id === questionId 
              ? { ...currentQuestion!, text: newQuestion.text, type: newQuestion.type, options: newQuestion.options }
              : q
          )
        })))
        
        // Mark question as rewritten and close rewrite section
        setRewrittenQuestions(prev => prev.includes(questionId) ? prev : [...prev, questionId])
        setRewriteExpanded(null)
        setRewriteFeedback(prev => ({ ...prev, [questionId]: "" }))
        
        // Save the updated questions to backend
        await saveAllQuestions()
        toast({ title: "Success", description: "Question rewritten and saved!" })
      } else {
        throw new Error('No rewritten question received')
      }
      
    } catch (error) {
      console.error('Error rewriting question:', error)
      toast({ title: "Error", description: "Failed to rewrite question. Please try again.", variant: "destructive" })
    } finally {
      setIsSubmittingFeedback("")
    }
  }, [sections, rewriteFeedback, toast, projectId, saveAllQuestions])

  // Load data on component mount
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch project details
        const projectData = await getProjectById(projectId)
        if (!projectData) {
          toast({ title: "Error", description: "Project not found.", variant: "destructive" })
          return
        }
        setProject(projectData)
        
        // Fetch all project sections (already detailed)
        const allSections = await getProjectSectionsDetailed(projectId)
        
        // Filter to only selected sections, or use all sections if none specifically selected
        const selectedSections = selectedSectionIds.length > 0 
          ? allSections.filter(section => selectedSectionIds.includes(section.id))
          : allSections
        
        if (selectedSections.length === 0) {
          toast({ title: "Warning", description: "No sections found.", variant: "destructive" })
          return
        }
        
        // Process sections - keep existing questions from the backend
        const processedSections = selectedSections.map(section => ({
          ...section,
          questions: section.questions || [], // Keep existing questions from backend
          isGenerating: false,
          isExpanded: true
        }))
        
        // Sort sections: Core sections first, then Prophecy sections
        const sortedSections = processedSections.sort((a, b) => {
          // Determine section types based on is_core flag or section properties
          const aIsCore = a.is_core !== undefined ? a.is_core : 
            (a.section_type === 'core' || !a.name?.toLowerCase().includes('prophecy'))
          const bIsCore = b.is_core !== undefined ? b.is_core : 
            (b.section_type === 'core' || !b.name?.toLowerCase().includes('prophecy'))
          
          // Core sections come first
          if (aIsCore && !bIsCore) return -1
          if (!aIsCore && bIsCore) return 1
          
          // Within same type, maintain original order
          return 0
        })
        
        setSections(sortedSections)
        
        // Fetch reprompt options
        const options = await getQuestionRepromptOptions()
        setRepromptOptions(options)
        setSelectedRepromptOption(options[0]?.id || '')
        
      } catch (error) {
        console.error('Error fetching project:', error)
        toast({ title: "Error", description: "Failed to load project data.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }

    loadProjectData()
  }, [projectId, selectedSectionIds])

  // Submit feedback and regenerate with context
  const submitFeedbackAndRegenerate = async (questionId: string, feedback: string) => {
    if (!feedback.trim()) {
      toast({ title: "Error", description: "Please provide feedback before submitting.", variant: "destructive" })
      return
    }

    setIsSubmittingFeedback(questionId)
    try {
      // Find the question
      const section = sections.find(s => s.questions.some(q => q.id === questionId))
      const question = section?.questions.find(q => q.id === questionId)
      
      if (!question) {
        throw new Error("Question not found")
      }

      const response = await repromptQuestions({
        original_questions: [{
          id: question.id,
          text: question.text,
          type: question.type,
          options: question.options
        }],
        reprompt_option: selectedRepromptOption,
        section_id: section?.id || '',
        project_id: projectId
      })

      if (response && response.length > 0) {
        // Update the question in the sections
        setSections(prevSections => 
          prevSections.map(s => 
            s.id === section?.id ? {
              ...s,
              questions: s.questions.map(q => 
                q.id === questionId ? response[0] : q
              )
            } : s
          )
        )
        
        // Clear feedback
        setFeedbackText(prev => ({ ...prev, [questionId]: '' }))
        
        toast({ title: "Success", description: "Question regenerated successfully!" })
      }
    } catch (error) {
      console.error('Error regenerating question:', error)
      toast({ title: "Error", description: "Failed to regenerate question.", variant: "destructive" })
    } finally {
      setIsSubmittingFeedback("")
    }
  }

  // Save all questions and proceed
  const handleSaveAndProceed = async () => {
    try {
      // Prepare sections data for saving
      const sectionsData = sections.map(section => ({
        id: section.id,
        custom_title: section.name,
        questions: section.questions.map((q, index) => ({
          id: q.id,
          question_text: q.text,
          question_type: q.type,
          position: index + 1,
          is_required: q.is_required,
                     answer_options: q.options?.map((opt, optIndex) => ({
             option_text: opt,
             position: optIndex + 1
           })) || []
        }))
      }))

      await saveProjectQuestions(projectId, sectionsData)
      await updateProjectStatus(projectId, 'questions_complete')
      
      toast({ title: "Success", description: "Questions saved successfully!" })
      router.push(`/projects/${projectId}/review`)
    } catch (error) {
      console.error('Error saving questions:', error)
      toast({ title: "Error", description: "Failed to save questions.", variant: "destructive" })
    }
  }

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ))
  }

  // Render static content
  const renderStaticContent = useCallback((contentData: any) => {
    if (!contentData) {
      console.log('⚠️ No static content data provided')
      return null
    }
    
    // Debug: Log the content structure
    console.log('🔍 Static content structure:', contentData)
    
    if (editingSection && typeof contentData === 'string') {
      return (
        <Textarea
          value={contentData}
          onChange={(e) => setSections(prev => prev.map(s => 
            s.id === editingSection ? { ...s, static_content: e.target.value } : s
          ))}
          className="w-full"
        />
      )
    }
    
    // Extract the actual content string from the object
    let contentString = ''
    if (typeof contentData === 'object' && contentData.content) {
      contentString = contentData.content
    } else if (typeof contentData === 'string') {
      contentString = contentData
    } else {
      // Fallback for unknown structure
      return (
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
          {JSON.stringify(contentData, null, 2)}
        </pre>
      )
    }
    
    // Handle structured content from API
    if (contentData.content && Array.isArray(contentData.content)) {
      return (
        <div className="space-y-3">
          {contentData.content.map((item: any, index: number) => {
            switch (item.type) {
              case 'heading':
                return <h3 key={index} className="text-lg font-semibold text-gray-900">{item.text}</h3>
              case 'paragraph':
                return <p key={index} className="text-sm text-gray-700">{item.text}</p>
              case 'list':
                return (
                  <div key={index}>
                    {item.style === 'numbered' ? (
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                        {item.items.map((listItem: string, idx: number) => (
                          <li key={idx}>{listItem}</li>
                        ))}
                      </ol>
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {item.items.map((listItem: string, idx: number) => (
                          <li key={idx}>{listItem}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              case 'consent_checkbox':
                return (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">{item.text}</span>
                    {item.required && <span className="text-red-500">*</span>}
                  </div>
                )
              default:
                return <div key={index} className="text-sm text-gray-600">{JSON.stringify(item)}</div>
            }
          })}
        </div>
      )
    }
    
    // Handle survey question format (Demographics section with questions like WORK, DEM2, etc.)
    if (contentString && contentString.includes('\n')) {
      console.log('🔍 Content has newlines, checking if it needs survey parsing...', contentString.substring(0, 100))
      
      // Only parse as survey format if it looks like survey content (has question codes)
      const hasSurveyFormat = contentString.match(/^[A-Z0-9_]+$/m) && contentString.match(/^\d+$/m)
      
      if (!hasSurveyFormat) {
        console.log('✅ Not survey format, using simple rendering')
        // For simple text with newlines (like Introduction), just preserve formatting
        return (
          <div className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
            {contentString}
          </div>
        )
      }
      
      console.log('🔧 Parsing as survey format...')
      // Parse survey format content
      const lines = contentString.split('\n')
      const elements: JSX.Element[] = []
      let currentQuestion: {
        code?: string
        text?: string
        options?: string[]
        meta?: string
      } | null = null
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (!line) continue // Skip empty lines
        
        // Check if this is a question code (e.g., "WORK", "DEM2", "HH")
        if (line.match(/^[A-Z0-9_]+$/) && i + 1 < lines.length && lines[i + 1].match(/^\d+$/)) {
          // Save previous question if exists
          if (currentQuestion && currentQuestion.text) {
            elements.push(
              <div key={`q-${currentQuestion.code}`} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-600">{currentQuestion.code}</span>
                  {currentQuestion.meta && (
                    <span className="text-xs text-gray-500">{currentQuestion.meta}</span>
                  )}
                </div>
                <p className="font-medium text-gray-900 mb-3">{currentQuestion.text}</p>
                {currentQuestion.options && currentQuestion.options.length > 0 && (
                  <div className="space-y-1">
                    {currentQuestion.options.map((opt, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-sm text-gray-600">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          }
          
          // Start new question
          currentQuestion = {
            code: line,
            options: []
          }
          i++ // Skip the number on next line
        }
        // Check for question metadata (e.g., "ASK IF WORK = 1 OR 2")
        else if (line.startsWith('ASK IF') || line.match(/^(SR|MR|DNR)/)) {
          if (currentQuestion) {
            currentQuestion.meta = line
          }
        }
        // Check if line is an option (starts with number)
        else if (line.match(/^\d+\s+/) && currentQuestion) {
          currentQuestion.options?.push(line)
        }
        // Check for section headers (all caps)
        else if (line === line.toUpperCase() && line.length > 3 && !line.match(/^\d/)) {
          elements.push(
            <h4 key={`header-${i}`} className="text-sm font-bold text-gray-800 uppercase tracking-wide mt-6 mb-3">
              {line}
            </h4>
          )
        }
        // Otherwise it's likely question text
        else if (currentQuestion && !currentQuestion.text && line.length > 10) {
          currentQuestion.text = line
        }
        // Handle option groups
        else if (line && currentQuestion && currentQuestion.options) {
          // Could be a category header for options
          if (!line.match(/^\d/) && lines[i + 1]?.match(/^\d+\s+/)) {
            currentQuestion.options.push(`\n${line}`) // Add as header
          } else {
            currentQuestion.options.push(line)
          }
        }
      }
      
      // Don't forget the last question
      if (currentQuestion && currentQuestion.text) {
        elements.push(
          <div key={`q-${currentQuestion.code}`} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-blue-600">{currentQuestion.code}</span>
              {currentQuestion.meta && (
                <span className="text-xs text-gray-500">{currentQuestion.meta}</span>
              )}
            </div>
            <p className="font-medium text-gray-900 mb-3">{currentQuestion.text}</p>
            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className="space-y-1">
                {currentQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-sm text-gray-600">{opt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }
      
      return <div className="space-y-4">{elements}</div>
    }
    
    // Fallback for simple string content
    return (
      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
        {contentString || JSON.stringify(contentData, null, 2)}
      </pre>
    )
  }, [editingSection])

  // Open rewrite modal
  const openRewriteModal = useCallback((sectionId: string) => {
    setEditingSection(sectionId)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <WorkflowNavigation currentStep="questions" projectId={projectId} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading sections and questions...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <WorkflowNavigation currentStep="questions" projectId={projectId} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Questions</h1>
          <p className="text-gray-600">
            Review the generated questions and static content for your survey. You can provide feedback to regenerate specific questions.
          </p>
        </div>


        {/* Sections */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  toggleSection={toggleSection}
                  renderStaticContent={renderStaticContent}
                  editingSection={editingSection}
                  setEditingSection={setEditingSection}
                  openRewriteModal={openRewriteModal}
                  generateQuestionsForSection={generateQuestionsForSection}
                  feedbackText={feedbackText}
                  setFeedbackText={setFeedbackText}
                  selectedRepromptOption={selectedRepromptOption}
                  setSelectedRepromptOption={setSelectedRepromptOption}
                  repromptOptions={repromptOptions}
                  submitFeedbackAndRegenerate={submitFeedbackAndRegenerate}
                  isSubmittingFeedback={isSubmittingFeedback}
                  editingQuestion={editingQuestion}
                  setEditingQuestion={setEditingQuestion}
                  editedText={editedText}
                  setEditedText={setEditedText}
                  rewriteExpanded={rewriteExpanded}
                  setRewriteExpanded={setRewriteExpanded}
                  rewriteFeedback={rewriteFeedback}
                  setRewriteFeedback={setRewriteFeedback}
                  handleSaveEdit={handleSaveEdit}
                  handleDeleteQuestion={handleDeleteQuestion}
                  handleRewriteWithFeedback={handleRewriteWithFeedback}
                  editedQuestions={editedQuestions}
                  rewrittenQuestions={rewrittenQuestions}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

      </div>
    </div>
  )
}
