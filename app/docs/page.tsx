import { Navbar } from "@/components/landing"
import { Documentation } from "@/components/dashboard/documentation"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Documentation />
      </main>
    </div>
  )
}
