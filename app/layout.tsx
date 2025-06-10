import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
// Header will be rendered per page to allow for dynamic titles/buttons
import { Toaster } from "@/components/ui/toaster"
import localFont from "next/font/local"

const sfPro = localFont({
  src: [
    {
      path: "../public/fonts/SF-Pro-Display-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Display-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Display-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Display-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
})

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
      <body className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased ${sfPro.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Header is removed from here and added to individual page layouts or pages */}
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
