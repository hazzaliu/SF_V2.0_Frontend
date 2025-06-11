"use client"

// Based on ProjectDashboard.html
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/types"
import { FileTextIcon, ClockIcon, BarChart3Icon, EditIcon, Trash2Icon, Share2Icon, CopyIcon } from "lucide-react"

interface ProjectListItemProps {
  project: Project
  onDelete: (projectId: string) => void
}

export default function ProjectListItemDashboard({ project, onDelete }: ProjectListItemProps) {
  const { id, project_name, client_name, status, last_modified, question_count, estimated_duration, project_number } =
    project

  const getStatusVariant = (status: Project["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Completed":
        return "default" // Green in mockup, shadcn default is often blueish
      case "In Progress":
        return "secondary" // Blue in mockup
      case "Draft":
        return "outline" // Orange/Yellow in mockup
      default:
        return "default"
    }
  }

  const getStatusColorClass = (status: Project["status"]): string => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700"
      case "In Progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-700"
      case "Draft":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold leading-none tracking-tight group">
            <Link href={`/projects/${id}/sections`} className="hover:text-primary transition-colors">
              {project_name}
            </Link>
          </CardTitle>
          <Badge variant={getStatusVariant(status)} className={`whitespace-nowrap ${getStatusColorClass(status)}`}>
            {status}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Client: {client_name} | Project #: {project_number}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-3 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center">
          <BarChart3Icon className="mr-1.5 h-3.5 w-3.5" />
          {question_count || 0} questions
        </div>
        <div className="flex items-center">
          <ClockIcon className="mr-1.5 h-3.5 w-3.5" />
          Est. {estimated_duration || "N/A"}
        </div>
        <div className="flex items-center">
          <FileTextIcon className="mr-1.5 h-3.5 w-3.5" />
          Last modified: {new Date(last_modified).toLocaleDateString()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 py-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${id}/edit`}>
            <EditIcon className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => alert(`Sharing project ${id}`)}>
          <Share2Icon className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Share</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => alert(`Duplicating project ${id}`)}>
          <CopyIcon className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Duplicate</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50"
          onClick={() => onDelete(id)}
        >
          <Trash2Icon className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
