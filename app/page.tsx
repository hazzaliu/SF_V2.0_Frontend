"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, PlayCircle } from "lucide-react"

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"}`}
      >
        <div className="container max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="font-semibold text-xl">SurveyForge</span>
            </Link>

            <div className="hidden md:flex items-center justify-center space-x-8">
              <Link href="#features" className="text-secondary hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#showcase" className="text-secondary hover:text-primary transition-colors">
                Showcase
              </Link>
              <Link href="#testimonials" className="text-secondary hover:text-primary transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-secondary hover:text-primary transition-colors">
                Pricing
              </Link>
            </div>

            <div>
              <Button asChild className="rounded-full">
                <Link href="/projects">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="container max-w-screen-xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Design Beautiful Surveys
            <br />
            That Get Answers
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Create, customize, and distribute surveys effortlessly. Built for teams, trusted by professionals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg">
              <Link href="/projects/new">Start for Free</Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg">
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-muted">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create professional surveys and gather meaningful insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="h-48 mb-6 rounded-xl bg-[url('/placeholder.svg?height=400&width=600')] bg-cover bg-center"></div>
              <h3 className="text-xl font-semibold mb-3">Drag-and-Drop Survey Builder</h3>
              <p className="text-muted-foreground">
                Create professional surveys in minutes with our intuitive drag-and-drop interface. No coding required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="h-48 mb-6 rounded-xl bg-[url('/placeholder.svg?height=400&width=600')] bg-cover bg-center"></div>
              <h3 className="text-xl font-semibold mb-3">Real-time Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Monitor responses in real-time and generate beautiful reports with actionable insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="h-48 mb-6 rounded-xl bg-[url('/placeholder.svg?height=400&width=600')] bg-cover bg-center"></div>
              <h3 className="text-xl font-semibold mb-3">Custom Branding & Themes</h3>
              <p className="text-muted-foreground">
                Personalize your surveys with your brand colors, logos, and custom themes to match your identity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section id="showcase" className="py-20 md:py-32">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Beautifully Designed Experience</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines powerful functionality with elegant design for a seamless survey creation
              experience.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl shadow-xl">
            <img src="/placeholder.svg?height=800&width=1600" alt="SurveyForge Interface" className="w-full h-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold">AI-Powered Question Generation</h4>
                  <p className="text-muted-foreground">Generate professional survey questions with our AI assistant.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold">Methodology-Specific Templates</h4>
                  <p className="text-muted-foreground">
                    Choose from templates designed for specific research methodologies.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold">Multi-Format Export</h4>
                  <p className="text-muted-foreground">
                    Export your surveys in multiple formats including PDF, Word, and CSV.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold">Real-time Collaboration</h4>
                  <p className="text-muted-foreground">Work together with your team in real-time on survey projects.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-32 bg-black text-white">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Professionals</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See what our customers are saying about SurveyForge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 rounded-3xl border border-gray-800 transition-all duration-300 hover:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-[url('/placeholder.svg?height=100&width=100')] bg-cover bg-center mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-gray-400 text-sm">Research Director, TechCorp</p>
                </div>
              </div>
              <p className="text-gray-300">
                "SurveyForge has transformed how we conduct market research. The AI-powered question generation saves us
                hours of work."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-3xl border border-gray-800 transition-all duration-300 hover:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-[url('/placeholder.svg?height=100&width=100')] bg-cover bg-center mr-4"></div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-gray-400 text-sm">Product Manager, InnovateCo</p>
                </div>
              </div>
              <p className="text-gray-300">
                "The methodology-specific templates have been a game-changer for our product feedback surveys. Highly
                recommended!"
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-3xl border border-gray-800 transition-all duration-300 hover:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-[url('/placeholder.svg?height=100&width=100')] bg-cover bg-center mr-4"></div>
                <div>
                  <h4 className="font-semibold">Priya Patel</h4>
                  <p className="text-gray-400 text-sm">CX Manager, RetailGiant</p>
                </div>
              </div>
              <p className="text-gray-300">
                "We've seen a 40% increase in survey completion rates since switching to SurveyForge. The interface is
                beautiful and intuitive."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for you and your team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
              <h3 className="text-2xl font-semibold mb-2">Free</h3>
              <p className="text-muted-foreground mb-6">For individuals getting started</p>
              <div className="text-4xl font-bold mb-6">
                $0<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Up to 3 surveys</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>100 responses per survey</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Basic templates</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Export to PDF</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link href="/projects/new">Get Started</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-3xl shadow-md border border-primary/20 transition-all duration-300 hover:shadow-lg relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                POPULAR
              </div>
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">For professionals and small teams</p>
              <div className="text-4xl font-bold mb-6">
                $29<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Unlimited surveys</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>1,000 responses per survey</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Advanced templates & AI features</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Export to PDF, Word, CSV</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Team collaboration (up to 5)</span>
                </li>
              </ul>
              <Button asChild className="w-full rounded-full">
                <Link href="/projects/new">Start Free Trial</Link>
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
              <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
              <p className="text-muted-foreground mb-6">For organizations with advanced needs</p>
              <div className="text-4xl font-bold mb-6">
                $99<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Unlimited everything</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Advanced analytics & reporting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Custom branding & white label</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>API access & integrations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-muted">
        <div className="container max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to create better surveys?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of professionals who trust SurveyForge for their research needs.
          </p>
          <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg">
            <Link href="/projects/new">
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="font-semibold text-lg">SurveyForge</span>
              </div>
              <p className="text-gray-400 text-sm">Creating beautiful surveys that get meaningful answers.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 SurveyForge. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
