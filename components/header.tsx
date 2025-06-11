import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileTextIcon, PlusCircleIcon, SettingsIcon, UserCircleIcon } from "lucide-react"

interface HeaderProps {
  pageTitle?: string
  stepNumber?: number
  showNewProjectButton?: boolean
}

export default function Header({ pageTitle, stepNumber, showNewProjectButton = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center max-w-screen-2xl mx-auto px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <FileTextIcon className="h-7 w-7 text-primary" />
          <span className="font-bold text-xl sm:inline-block">SurveyForge</span>
        </Link>

        {pageTitle && stepNumber && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              {stepNumber}
            </div>
            <span>{pageTitle}</span>
          </div>
        )}

        <div className="flex flex-1 items-center justify-end space-x-4">
          {showNewProjectButton && (
            <Button asChild size="sm" className="rounded-full">
              <Link href="/projects/new">
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" aria-label="Settings" className="rounded-full">
            <SettingsIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="User Profile" className="rounded-full">
            <UserCircleIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
