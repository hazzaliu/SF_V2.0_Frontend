import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/types"
import { ChevronRightIcon, ClockIcon, UsersIcon, FileTextIcon } from "lucide-react"

interface ProjectListItemProps {
  project: Project
}

export default function ProjectListItem({ project }: ProjectListItemProps) {
  const { id, project_name, client_name, methodology_name, status, last_modified } = project

  const getStatusVariant = (status: Project["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Completed":
        return "default" // Or a success variant if you have one
      case "In Progress":
        return "secondary" // Or an 'outline' with a specific color
      case "Draft":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project_name}</CardTitle>
          <Badge variant={getStatusVariant(status)}>{status}</Badge>
        </div>
        <CardDescription className="flex items-center text-sm text-muted-foreground pt-1">
          <UsersIcon className="h-4 w-4 mr-1.5" />
          {client_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {methodology_name && (
            <div className="flex items-center text-muted-foreground">
              <FileTextIcon className="h-4 w-4 mr-1.5" />
              Methodology: {methodology_name}
            </div>
          )}
          <div className="flex items-center text-muted-foreground">
            <ClockIcon className="h-4 w-4 mr-1.5" />
            Last modified: {new Date(last_modified).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/projects/${id}/sections`}>
            View Details <ChevronRightIcon className="h-4 w-4 ml-1.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
