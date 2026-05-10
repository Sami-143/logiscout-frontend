"use client"

import {
  Navbar,
  Hero,
  Stats,
  Features,
  HowItWorks,
  Integrations,
  Blogs,
  Contact,
  CTA,
  Footer,
} from "@/components/landing"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Integrations />
      <Blogs />
      <Contact />
      <CTA />
      <Footer />
    </div>
  )
}
