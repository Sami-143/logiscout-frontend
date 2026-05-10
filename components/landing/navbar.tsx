"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Zap, Menu, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Features", href: "/#features", id: "features" },
  { label: "How It Works", href: "/#how-it-works", id: "how-it-works" },
  { label: "About", href: "/about", id: "about" },
  { label: "Contact", href: "/#contact", id: "contact" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>("")
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const sections = NAV_LINKS
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const isDark = theme === "dark"

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/75 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="LogiScout — home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold text-foreground">LogiScout</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const isRoute = link.href.startsWith("/") && !link.href.includes("#")
            const active = isRoute ? pathname === link.href : activeId === link.id
            const className = cn(
              "relative rounded-md px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )
            const indicator = active && (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            )
            return isRoute ? (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={className}>
                {link.label}
                {indicator}
              </Link>
            ) : (
              <a key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={className}>
                {link.label}
                {indicator}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="hidden sm:inline-flex"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </Button>
          )}

          <Link href="/auth/login" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/auth/signup" className="hidden sm:inline-flex">
            <Button size="sm" className="shadow-sm shadow-primary/25">
              Start Free
            </Button>
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 pt-12">
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {NAV_LINKS.map((link) => {
                  const isRoute = link.href.startsWith("/") && !link.href.includes("#")
                  const active = isRoute ? pathname === link.href : activeId === link.id
                  const className = cn(
                    "rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted",
                  )
                  return isRoute ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={className}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={className}
                    >
                      {link.label}
                    </a>
                  )
                })}
                <div className="my-4 border-t border-border" />
                {mounted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="mb-2 justify-start gap-2"
                    aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                  >
                    {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                    {isDark ? "Light mode" : "Dark mode"}
                  </Button>
                )}
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="mt-2 w-full">Start Free</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
