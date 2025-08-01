"use client"

import React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import type { ProjectFormProps, Project, Methodology, ProjectVariable } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { InfoIcon, Loader2Icon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const initialTemplateVariables: ProjectVariable[] = [
  { name: "Action", value: "" },
  { name: "Product", value: "" },
  { name: "Product Type", value: "" },
  { name: "S_Product Type", value: "" },
  { name: "Supplier", value: "" },
  { name: "Supplier A", value: "" },
  { name: "Supplier B", value: "" },
  { name: "Supplier C", value: "" },
  { name: "Time", value: "" },
]

export default function ProjectForm({ project, methodologies, industries, onSave, isSubmitting }: ProjectFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = React.useState<
    Omit<
      Project,
      | "id"
      | "status"
      | "last_modified"
      | "methodology_name"
      | "industry_name"
      | "question_count"
      | "estimated_duration"
      | "survey_sections"
    >
  >({
    client_name: project?.client_name || "",
    project_name: project?.project_name || "",
    project_number: project?.project_number || "",
    methodology_id: project?.methodology_id || "",
    industry_id: project?.industry_id || "",
    research_objectives: project?.research_objectives || "",
    sample_size: project?.sample_size || "",
    loi: project?.loi || undefined,
    target_country: project?.target_country || "AU", // Default from mockup
    sample_type: project?.sample_type || undefined,
    sample_profile: project?.sample_profile || "",
    language_preference: project?.language_preference || "en", // Default from mockup
    addressable_market: project?.addressable_market || "",
    streams: project?.streams || "",
    template_variables: project?.template_variables || initialTemplateVariables.map((v) => ({ ...v })), // Deep copy
  })

  const [selectedMethodology, setSelectedMethodology] = React.useState<Methodology | undefined>(
    project ? methodologies.find((m) => m.id === project.methodology_id) : undefined,
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "loi" ? (value ? Number.parseInt(value) : undefined) : value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "methodology_id") {
      setSelectedMethodology(methodologies.find((m) => m.id.toString() === value))
    }
  }

  const handleTemplateVariableChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newVars = [...(prev.template_variables || [])]
      newVars[index] = { ...newVars[index], value }
      return { ...prev, template_variables: newVars }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.methodology_id || !formData.industry_id) {
      toast({
        title: "Validation Error",
        description: "Please select a methodology and industry.",
        variant: "destructive",
      })
      return
    }

    const result = await onSave(formData)
    if (result) {
      // The parent page (create/edit) will handle redirection and toast messages
    }
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📋</span> Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_name">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="client_name"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="project_number">
                  Project Number <span className="text-red-500">*</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unique identifier for this project (e.g., PRJ-2024-001)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="project_number"
                  name="project_number"
                  value={formData.project_number}
                  onChange={handleInputChange}
                  placeholder="e.g., PRJ-2024-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="project_name">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="project_name"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="loi">
                  Length of Interview (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="loi"
                  name="loi"
                  type="number"
                  value={formData.loi || ""}
                  onChange={handleInputChange}
                  placeholder="15"
                  min="1"
                  max="120"
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry_id">
                  Industry Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="industry_id"
                  value={String(formData.industry_id)}
                  onValueChange={(value) => handleSelectChange("industry_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((i) => (
                      <SelectItem key={i.id} value={String(i.id)}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="methodology_id">
                  Methodology <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="methodology_id"
                  value={String(formData.methodology_id)}
                  onValueChange={(value) => handleSelectChange("methodology_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select methodology" />
                  </SelectTrigger>
                  <SelectContent>
                    {methodologies.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target_country">
                  Target Country <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="target_country"
                  value={formData.target_country}
                  onValueChange={(value) => handleSelectChange("target_country", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {["AU", "US", "UK", "CA", "NZ"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔬</span> Research Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sample_size">
                  Sample Size <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sample_size"
                  name="sample_size"
                  value={formData.sample_size}
                  onChange={handleInputChange}
                  placeholder="e.g., N=1000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sample_type">
                  Sample Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="sample_type"
                  value={formData.sample_type}
                  onValueChange={(value) => handleSelectChange("sample_type", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sample type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="panel">Panel</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="research_objectives">
                Research Objectives <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="research_objectives"
                name="research_objectives"
                value={formData.research_objectives}
                onChange={handleInputChange}
                placeholder="Describe the main goals of this research project..."
                required
              />
            </div>
            <div>
              <Label htmlFor="sample_profile">Sample Profile</Label>
              <Textarea
                id="sample_profile"
                name="sample_profile"
                value={formData.sample_profile}
                onChange={handleInputChange}
                placeholder="Describe the target demographic and characteristics..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addressable_market">Addressable Market</Label>
                <Input
                  id="addressable_market"
                  name="addressable_market"
                  value={formData.addressable_market}
                  onChange={handleInputChange}
                  placeholder="e.g., Adults 18-65"
                />
              </div>
              <div>
                <Label htmlFor="streams">Streams (if applicable)</Label>
                <Input
                  id="streams"
                  name="streams"
                  value={formData.streams}
                  onChange={handleInputChange}
                  placeholder="Specify any research streams or variations"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end sticky bottom-0 bg-background/90 dark:bg-background/90 py-4 border-t backdrop-blur-sm">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {project ? "Save Changes" : "Create Project & Continue"}
          </Button>
        </CardFooter>
      </form>
    </TooltipProvider>
  )
}
