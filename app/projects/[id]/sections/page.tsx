"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import WorkflowNavigation from "@/components/workflow-navigation"
import { getProjectById } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeftIcon, SearchIcon, XIcon, Loader2Icon } from "lucide-react"
import type { Project } from "@/types"

// Define types for methodologies and sections
interface Methodology {
  id: string
  name: string
  description: string
  sectionCount: number
}

interface Section {
  id: string
  name: string
  description: string
  questionCount: string
  type: "basic" | "prophecy" | "cx" | "choice" | "segmentation" | "ua" | "ad-testing"
  isDefault?: boolean
  methodology?: string
}

// Mock data for methodologies
const methodologies: Methodology[] = [
  {
    id: "prophecy",
    name: "Prophecy",
    description: "Predictive market research methodology for understanding future brand and business outcomes.",
    sectionCount: 5,
  },
  {
    id: "cx",
    name: "CX (Customer Experience)",
    description: "Comprehensive customer experience measurement and satisfaction modeling.",
    sectionCount: 5,
  },
  {
    id: "choice",
    name: "Choice",
    description: "Choice modeling methodology for understanding decision-making processes.",
    sectionCount: 4,
  },
  {
    id: "ad-testing",
    name: "In-Market Ad Testing",
    description: "Test advertisement effectiveness in real market conditions.",
    sectionCount: 5,
  },
  {
    id: "segmentation",
    name: "Segmentation",
    description: "Market and customer segmentation analysis.",
    sectionCount: 3,
  },
  {
    id: "ua",
    name: "U&A (Usage & Attitudes)",
    description: "Usage and Attitudes studies.",
    sectionCount: 4,
  },
]

// Comprehensive sections library
const availableSections: Section[] = [
  // Basic sections (always available)
  {
    id: "screeners",
    name: "Screeners",
    description: "Essential screening questions to qualify respondents for your survey.",
    questionCount: "3-5 questions",
    type: "basic",
    isDefault: true,
  },
  {
    id: "profiling",
    name: "Profiling",
    description: "Behavioral and attitudinal profiling questions to understand respondent characteristics.",
    questionCount: "5-8 questions",
    type: "basic",
    isDefault: true,
  },
  {
    id: "demographics",
    name: "Demographics",
    description: "Standard demographic questions including age, gender, location, and income.",
    questionCount: "6-10 questions",
    type: "basic",
    isDefault: true,
  },

  // Prophecy methodology sections
  {
    id: "brand-awareness",
    name: "Brand Awareness & Recognition",
    description: "Measure spontaneous and aided brand awareness across your category.",
    questionCount: "4-6 questions",
    type: "prophecy",
    methodology: "Prophecy",
  },
  {
    id: "product-awareness",
    name: "Product Awareness",
    description: "Questions about product familiarity and recognition in the market.",
    questionCount: "3-5 questions",
    type: "prophecy",
    methodology: "Prophecy",
  },
  {
    id: "purchase-intent",
    name: "Purchase Intent",
    description: "Measuring likelihood to purchase and key decision factors.",
    questionCount: "4-7 questions",
    type: "prophecy",
    methodology: "Prophecy",
  },
  {
    id: "brand-perception",
    name: "Brand Perception",
    description: "Understanding brand image, positioning, and competitive landscape.",
    questionCount: "6-8 questions",
    type: "prophecy",
    methodology: "Prophecy",
  },
  {
    id: "market-trends",
    name: "Market Trends & Future Outlook",
    description: "Predictive questions about market direction and future behaviors.",
    questionCount: "5-7 questions",
    type: "prophecy",
    methodology: "Prophecy",
  },

  // CX (Customer Experience) sections
  {
    id: "customer-journey",
    name: "Customer Journey Mapping",
    description: "Track touchpoints and experiences across the customer lifecycle.",
    questionCount: "8-12 questions",
    type: "cx",
    methodology: "CX",
  },
  {
    id: "satisfaction-measurement",
    name: "Satisfaction Measurement",
    description: "Comprehensive satisfaction scoring across multiple dimensions.",
    questionCount: "6-10 questions",
    type: "cx",
    methodology: "CX",
  },
  {
    id: "nps-loyalty",
    name: "NPS & Loyalty",
    description: "Net Promoter Score and customer loyalty measurement.",
    questionCount: "3-5 questions",
    type: "cx",
    methodology: "CX",
  },
  {
    id: "service-quality",
    name: "Service Quality Assessment",
    description: "Evaluate service delivery across key quality dimensions.",
    questionCount: "7-9 questions",
    type: "cx",
    methodology: "CX",
  },
  {
    id: "complaint-resolution",
    name: "Complaint & Resolution",
    description: "Understanding complaint handling and resolution effectiveness.",
    questionCount: "4-6 questions",
    type: "cx",
    methodology: "CX",
  },

  // Choice Modeling sections
  {
    id: "choice-scenarios",
    name: "Choice Scenarios",
    description: "Present choice sets to understand decision-making preferences.",
    questionCount: "8-15 questions",
    type: "choice",
    methodology: "Choice",
  },
  {
    id: "attribute-importance",
    name: "Attribute Importance",
    description: "Rank and rate importance of product/service attributes.",
    questionCount: "5-8 questions",
    type: "choice",
    methodology: "Choice",
  },
  {
    id: "price-sensitivity",
    name: "Price Sensitivity",
    description: "Understanding price elasticity and willingness to pay.",
    questionCount: "4-6 questions",
    type: "choice",
    methodology: "Choice",
  },
  {
    id: "competitive-analysis",
    name: "Competitive Analysis",
    description: "Compare offerings against competitive alternatives.",
    questionCount: "6-8 questions",
    type: "choice",
    methodology: "Choice",
  },

  // Ad Testing sections
  {
    id: "ad-recall",
    name: "Ad Recall & Recognition",
    description: "Measure advertisement recall and recognition metrics.",
    questionCount: "4-6 questions",
    type: "ad-testing",
    methodology: "In-Market Ad Testing",
  },
  {
    id: "message-comprehension",
    name: "Message Comprehension",
    description: "Evaluate understanding and interpretation of key messages.",
    questionCount: "5-7 questions",
    type: "ad-testing",
    methodology: "In-Market Ad Testing",
  },
  {
    id: "ad-effectiveness",
    name: "Ad Effectiveness",
    description: "Measure impact on brand metrics and purchase intent.",
    questionCount: "6-8 questions",
    type: "ad-testing",
    methodology: "In-Market Ad Testing",
  },
  {
    id: "creative-evaluation",
    name: "Creative Evaluation",
    description: "Assess creative elements, appeal, and emotional response.",
    questionCount: "7-9 questions",
    type: "ad-testing",
    methodology: "In-Market Ad Testing",
  },
  {
    id: "media-consumption",
    name: "Media Consumption",
    description: "Understanding media habits and channel preferences.",
    questionCount: "5-7 questions",
    type: "ad-testing",
    methodology: "In-Market Ad Testing",
  },

  // Segmentation sections
  {
    id: "behavioral-segmentation",
    name: "Behavioral Segmentation",
    description: "Segment based on usage patterns and behaviors.",
    questionCount: "8-12 questions",
    type: "segmentation",
    methodology: "Segmentation",
  },
  {
    id: "psychographic-profiling",
    name: "Psychographic Profiling",
    description: "Lifestyle, values, and personality-based segmentation.",
    questionCount: "10-15 questions",
    type: "segmentation",
    methodology: "Segmentation",
  },
  {
    id: "needs-based-segmentation",
    name: "Needs-Based Segmentation",
    description: "Segment customers based on underlying needs and motivations.",
    questionCount: "6-10 questions",
    type: "segmentation",
    methodology: "Segmentation",
  },

  // U&A (Usage & Attitudes) sections
  {
    id: "usage-patterns",
    name: "Usage Patterns",
    description: "Detailed usage frequency, occasions, and contexts.",
    questionCount: "6-8 questions",
    type: "ua",
    methodology: "U&A",
  },
  {
    id: "attitudes-perceptions",
    name: "Attitudes & Perceptions",
    description: "Category and brand attitudes, perceptions, and beliefs.",
    questionCount: "8-12 questions",
    type: "ua",
    methodology: "U&A",
  },
  {
    id: "category-dynamics",
    name: "Category Dynamics",
    description: "Understanding category evolution and trends.",
    questionCount: "5-7 questions",
    type: "ua",
    methodology: "U&A",
  },
  {
    id: "brand-switching",
    name: "Brand Switching",
    description: "Analyze brand loyalty and switching behaviors.",
    questionCount: "4-6 questions",
    type: "ua",
    methodology: "U&A",
  },
]

export default function SectionLibraryPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMethodology, setSelectedMethodology] = useState<string | null>(null)
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  // Fetch project data
  const fetchProject = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedProject = await getProjectById(projectId)
      if (fetchedProject) {
        setProject(fetchedProject)
        // Auto-select methodology based on project
        if (fetchedProject.methodology_name) {
          const methodologyKey = getMethodologyKey(fetchedProject.methodology_name)
          setSelectedMethodology(methodologyKey)
          handleMethodologySelect(methodologyKey)
        }
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

  // Initialize with default sections
  useEffect(() => {
    const defaultSections = availableSections.filter((section) => section.isDefault).map((section) => section.id)
    setSelectedSections(new Set(defaultSections))
  }, [])

  // Helper function to map methodology names to keys
  const getMethodologyKey = (methodologyName: string): string => {
    const mapping: { [key: string]: string } = {
      Prophecy: "prophecy",
      "CX (Customer Experience)": "cx",
      "Choice Modelling": "choice",
      "In-Market Ad Testing": "ad-testing",
      Segmentation: "segmentation",
      "U&A": "ua",
    }
    return mapping[methodologyName] || "prophecy"
  }

  // Handle methodology selection
  const handleMethodologySelect = (methodologyId: string) => {
    setSelectedMethodology(methodologyId)

    // Keep basic sections and add methodology-specific sections
    const basicSections = availableSections.filter((section) => section.type === "basic").map((section) => section.id)
    const methodologySections = availableSections
      .filter((section) => section.type === methodologyId)
      .map((section) => section.id)

    setSelectedSections(new Set([...basicSections, ...methodologySections]))
  }

  // Handle section toggle
  const toggleSection = (sectionId: string) => {
    const newSelectedSections = new Set(selectedSections)
    if (newSelectedSections.has(sectionId)) {
      newSelectedSections.delete(sectionId)
    } else {
      newSelectedSections.add(sectionId)
    }
    setSelectedSections(newSelectedSections)
  }

  // Filter sections based on search and filter type
  const filteredSections = availableSections.filter((section) => {
    const matchesSearch =
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || section.type === filterType
    return matchesSearch && matchesFilter
  })

  // Handle continue to next step
  const handleContinue = async () => {
    // In a real app, you would save the selected sections to the project
    console.log("Selected sections:", Array.from(selectedSections))
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
      <Header pageTitle="Section Library" stepNumber={2} />
      <main className="container max-w-screen-xl mx-auto py-8 px-4 md:px-6 pb-24">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Section Library</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your project methodology is <strong>{project.methodology_name}</strong>. Default sections have been
            pre-selected, but you can customize by adding or removing sections.
          </p>
        </div>

        {/* Current Project Info */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Current Project: {project.project_name}</CardTitle>
            <CardDescription>
              <strong>Methodology:</strong> {project.methodology_name} | <strong>Industry:</strong>{" "}
              {project.industry_name} | <strong>Target:</strong> {project.target_country}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Methodology Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Available Methodologies</CardTitle>
            <CardDescription>
              Your primary methodology is pre-selected, but you can explore sections from other methodologies to enhance
              your survey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {methodologies.map((methodology) => (
                <div
                  key={methodology.id}
                  onClick={() => handleMethodologySelect(methodology.id)}
                  className={`p-5 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedMethodology === methodology.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{methodology.name}</h3>
                    {getMethodologyKey(project.methodology_name || "") === methodology.id && (
                      <Badge variant="default" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{methodology.description}</p>
                  <p className="text-sm text-primary mt-2">{methodology.sectionCount} sections available</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section Library */}
        <Card className="mb-8">
          <CardHeader className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <CardTitle className="text-2xl">Available Sections</CardTitle>
              <CardDescription>Browse and select sections to include in your survey</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search sections..."
                  className="pl-10 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="basic">Basic Sections</SelectItem>
                  <SelectItem value="prophecy">Prophecy</SelectItem>
                  <SelectItem value="cx">CX</SelectItem>
                  <SelectItem value="choice">Choice</SelectItem>
                  <SelectItem value="ad-testing">Ad Testing</SelectItem>
                  <SelectItem value="segmentation">Segmentation</SelectItem>
                  <SelectItem value="ua">U&A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSections.map((section) => {
                const isSelected = selectedSections.has(section.id)
                return (
                  <Card
                    key={section.id}
                    className={`overflow-hidden transition-all hover:shadow-md ${
                      isSelected ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <CardHeader className="pb-3 flex flex-row justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{section.name}</CardTitle>
                        {section.methodology && (
                          <p className="text-xs text-muted-foreground mt-1">From {section.methodology}</p>
                        )}
                      </div>
                      <Badge
                        className={
                          section.type === "basic"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : section.type === "prophecy"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              : section.type === "cx"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : section.type === "choice"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                  : section.type === "ad-testing"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                    : section.type === "segmentation"
                                      ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                                      : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" // Default for U&A or others
                        }
                      >
                        {section.type === "basic"
                          ? "Basic"
                          : section.type === "prophecy"
                            ? "Prophecy"
                            : section.type === "cx"
                              ? "CX"
                              : section.type === "choice"
                                ? "Choice"
                                : section.type === "ad-testing"
                                  ? "Ad Testing"
                                  : section.type === "segmentation"
                                    ? "Segmentation"
                                    : "U&A"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground flex items-center">
                          <span className="mr-1">📊</span> {section.questionCount}
                        </div>
                        <Button
                          size="sm"
                          variant={isSelected ? "destructive" : "default"}
                          onClick={() => toggleSection(section.id)}
                        >
                          {isSelected ? "Remove" : "Add Section"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Sections Summary */}
        <Card className="bg-gradient-to-br from-primary/5 to-blue-100/20 dark:from-primary/10 dark:to-blue-900/10 border-primary/20 mb-12">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl">Selected Sections</CardTitle>
            <div className="text-4xl font-bold text-primary">{selectedSections.size}</div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from(selectedSections).map((sectionId) => {
                const section = availableSections.find((s) => s.id === sectionId)
                if (!section) return null
                return (
                  <div
                    key={sectionId}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full flex items-center gap-2"
                  >
                    {section.name}
                    <button
                      onClick={() => toggleSection(sectionId)}
                      className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                Estimated total questions:{" "}
                {Array.from(selectedSections)
                  .reduce((acc, sectionId) => {
                    const section = availableSections.find((s) => s.id === sectionId)
                    if (!section) return acc
                    const questionRange = section.questionCount.match(/(\d+)-?(\d+)?/)
                    const avgQuestions = questionRange
                      ? questionRange[2]
                        ? (Number.parseInt(questionRange[1]) + Number.parseInt(questionRange[2])) / 2
                        : Number.parseInt(questionRange[1])
                      : 5
                    return acc + avgQuestions
                  }, 0)
                  .toFixed(0)}
              </p>
              <p>
                Estimated completion time: {Math.ceil(Array.from(selectedSections).length * 1.5)}-
                {Math.ceil(Array.from(selectedSections).length * 2)} minutes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Consistent Navigation */}
        <WorkflowNavigation
          projectId={projectId}
          currentStep="sections"
          onNext={handleContinue}
          disableNext={selectedSections.size === 0}
        />
      </main>
    </>
  )
}
