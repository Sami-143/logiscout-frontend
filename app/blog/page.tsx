import { Navbar, Blogs, Footer, CTA } from "@/components/landing"

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <Blogs />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
