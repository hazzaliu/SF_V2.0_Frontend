"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import type { CreateProjectFormProps, Project, ProjectVariable } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { InfoIcon, Loader2Icon, UploadCloudIcon, FileIcon, XIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

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

export default function CreateProjectForm({ methodologies, industries, onProjectCreate }: CreateProjectFormProps) {
  const { toast } = useToast()

  const [designBriefFile, setDesignBriefFile] = React.useState<File | null>(null)

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
    client_name: "",
    project_name: "",
    project_number: "",
    methodology_id: "",
    industry_id: "",
    research_objectives: "",
    sample_size: "",
    loi: undefined,
    target_country: "AU", // Default from mockup
    sample_type: undefined,
    sample_profile: "",
    language_preference: "en", // Default from mockup
    addressable_market: "",
    streams: "",
    template_variables: initialTemplateVariables.map((v) => ({ ...v })), // Deep copy
    design_brief_file_name: "", // Add this
  })

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "loi" ? (value ? Number.parseInt(value) : undefined) : value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTemplateVariableChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newVars = [...(prev.template_variables || [])]
      newVars[index] = { ...newVars[index], value }
      return { ...prev, template_variables: newVars }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setDesignBriefFile(file)
      setFormData((prev) => ({ ...prev, design_brief_file_name: file.name }))
    }
  }

  const clearFile = () => {
    setDesignBriefFile(null)
    setFormData((prev) => ({ ...prev, design_brief_file_name: "" }))
    // Reset the file input visually if possible (requires a ref or uncontrolled input)
    const fileInput = document.getElementById("design_brief_file") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.client_name.trim()) errors.push("Client name is required")
    if (!formData.project_name.trim()) errors.push("Project name is required")
    if (!formData.project_number.trim()) errors.push("Project number is required")
    if (!formData.methodology_id) errors.push("Methodology selection is required")
    if (!formData.industry_id) errors.push("Industry selection is required")
    if (!formData.research_objectives.trim()) errors.push("Research objectives are required")
    if (!formData.sample_size.trim()) errors.push("Sample size is required")
    if (!formData.loi) errors.push("Length of Interview is required")
    if (!formData.target_country) errors.push("Target country is required")
    if (!formData.sample_type) errors.push("Sample type is required")

    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors[0],
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Inside handleSubmit, before onProjectCreate
      // if (designBriefFile) {
      //   // Here you would append designBriefFile to a FormData object
      //   // For now, formData.design_brief_file_name is already set
      // }
      await onProjectCreate(formData)
    } catch (error) {
      console.error("Failed to create project:", error)
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false)
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
              <div>
                <Label htmlFor="language_preference">
                  Language Preference <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="language_preference"
                  value={formData.language_preference}
                  onValueChange={(value) => handleSelectChange("language_preference", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
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

        {/* Project Assets Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📄</span> Project Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="design_brief_file">Design Overview Brief</Label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/70 transition-colors"
                onClick={() => document.getElementById("design_brief_file")?.click()}
              >
                <div className="space-y-1 text-center">
                  <UploadCloudIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="flex text-sm text-muted-foreground">
                    <span className="relative rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Upload a file</span>
                      <input
                        id="design_brief_file"
                        name="design_brief_file"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.md,image/*" // Specify acceptable file types
                      />
                    </span>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, MD, Images up to 10MB</p>
                </div>
              </div>
              {designBriefFile && (
                <div className="mt-3 flex items-center justify-between p-3 border rounded-md bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{designBriefFile.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {(designBriefFile.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFile} className="h-7 w-7">
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Template Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏷️</span> Template Variables
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Define variables that will be used throughout your survey questions for consistency and easy updates.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.template_variables?.map((variable, index) => (
                <div key={variable.name} className="space-y-2">
                  <Label htmlFor={`var-${index}`}>{variable.name}</Label>
                  <Input
                    id={`var-${index}`}
                    value={variable.value}
                    onChange={(e) => handleTemplateVariableChange(index, e.target.value)}
                    placeholder={`Enter ${variable.name.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end sticky bottom-0 bg-background/90 dark:bg-background/90 py-4 border-t backdrop-blur-sm">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Create Project & Continue
          </Button>
        </CardFooter>
      </form>
    </TooltipProvider>
  )
}
