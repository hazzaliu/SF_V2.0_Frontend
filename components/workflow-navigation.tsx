"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react"

export type WorkflowStep = "setup" | "sections" | "questions" | "order" | "export" | "finished"

interface WorkflowNavigationProps {
  currentStep: WorkflowStep
  projectId: string
  nextButtonText?: string
  backButtonText?: string
  onNext?: () => Promise<boolean> | boolean
  onBack?: () => void
  disableNext?: boolean
  disableBack?: boolean
  showBack?: boolean
  customNextHref?: string
  customBackHref?: string
}

const WORKFLOW_STEPS: { id: WorkflowStep; title: string; path: string }[] = [
  { id: "setup", title: "Project Setup", path: "" },
  { id: "sections", title: "Section Library", path: "/sections" },
  { id: "questions", title: "Question Review", path: "/questions" },
  { id: "order", title: "Section Order", path: "/order" },
  { id: "export", title: "Export & Review", path: "/export" },
  { id: "finished", title: "Finished", path: "/finished" },
]

export default function WorkflowNavigation({
  currentStep,
  projectId,
  nextButtonText,
  backButtonText,
  onNext,
  onBack,
  disableNext = false,
  disableBack = false,
  showBack = true,
  customNextHref,
  customBackHref,
}: WorkflowNavigationProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const currentIndex = WORKFLOW_STEPS.findIndex((step) => step.id === currentStep)
  const nextStep = currentIndex < WORKFLOW_STEPS.length - 1 ? WORKFLOW_STEPS[currentIndex + 1] : null
  const prevStep = currentIndex > 0 ? WORKFLOW_STEPS[currentIndex - 1] : null

  const getStepHref = (step: { id: WorkflowStep; path: string }): string => {
    return `/projects/${projectId}${step.path}`
  }

  const handleNext = async () => {
    if (disableNext) return

    setIsLoading(true)
    try {
      if (onNext) {
        const shouldProceed = await onNext()
        if (!shouldProceed) {
          setIsLoading(false)
          return
        }
      }

      if (nextStep) {
        router.push(customNextHref || getStepHref(nextStep))
      }
    } catch (error) {
      console.error("Error during navigation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (disableBack) return

    if (onBack) {
      onBack()
    } else if (prevStep) {
      router.push(customBackHref || getStepHref(prevStep))
    } else {
      router.push("/projects")
    }
  }

  const getDefaultNextButtonText = () => {
    switch (currentStep) {
      case "setup":
        return "Continue to Section Library"
      case "sections":
        return "Continue to Question Review"
      case "questions":
        return "Continue to Section Order"
      case "order":
        return "Continue to Export"
      case "export":
        return "Export Survey"
      default:
        return "Continue"
    }
  }

  const getDefaultBackButtonText = () => {
    switch (currentStep) {
      case "sections":
        return "Back to Project Setup"
      case "questions":
        return "Back to Section Library"
      case "order":
        return "Back to Question Review"
      case "export":
        return "Back to Section Order"
      case "finished":
        return "Back to Export"
      default:
        return "Back"
    }
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4 z-40 mt-12">
      <div className="container max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Progress Indicators */}
        <div className="hidden md:flex items-center space-x-2">
          {WORKFLOW_STEPS.slice(0, 5).map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  index < currentIndex
                    ? "bg-primary"
                    : index === currentIndex
                      ? "bg-primary ring-2 ring-primary/30"
                      : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
              {index < 4 && (
                <div className={`w-8 h-0.5 ${index < currentIndex ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
          {showBack && (prevStep || onBack) && (
            <Button variant="outline" onClick={handleBack} disabled={disableBack || isLoading}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              {backButtonText || getDefaultBackButtonText()}
            </Button>
          )}

          {nextStep && (
            <Button onClick={handleNext} disabled={disableNext || isLoading} className="min-w-[180px]">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {nextButtonText || getDefaultNextButtonText()}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
