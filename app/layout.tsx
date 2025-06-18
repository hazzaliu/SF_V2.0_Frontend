import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
// Header will be rendered per page to allow for dynamic titles/buttons
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
// Using system fonts for now

export const metadata: Metadata = {
  title: "SurveyForge",
  description: "AI-Powered Survey Creation Platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/error-handler.js" />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorBoundary>
            {/* Header is removed from here and added to individual page layouts or pages */}
            {children}
            <Toaster />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
