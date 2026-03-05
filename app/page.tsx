"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import {
  Navbar,
  Hero,
  Stats,
  Features,
  HowItWorks,
  Integrations,
  Pricing,
  Testimonials,
  CTA,
  Footer,
} from "@/components/landing"

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Integrations />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}
