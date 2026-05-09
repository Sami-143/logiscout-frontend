"use client"

import Link from "next/link"
import { Zap, Twitter, Github, MessageCircle, Mail, Phone, MapPin } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const SUPPORT_EMAIL = "logiscoutai@gmail.com"
const SUPPORT_PHONE = "03477586056"
const SUPPORT_PHONE_E164 = "+923477586056"
const SUPPORT_LOCATION = "Lahore, Pakistan"

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#integrations" },
    { label: "Docs", href: "/dashboard?view=docs" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "#contact" },
    { label: "Status", href: "/status" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "DPA", href: "/dpa" },
  ],
}

const SOCIAL = [
  { label: "Twitter", href: "https://twitter.com/logiscout", Icon: Twitter },
  { label: "GitHub", href: "https://github.com/logiscout", Icon: Github },
  { label: "Discord", href: "https://discord.gg/logiscout", Icon: MessageCircle },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5" aria-label="LogiScout — home">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/30">
                <Zap className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold text-foreground">LogiScout</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              AI-powered log management and incident resolution for modern engineering teams.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="break-all transition-colors hover:text-foreground"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                <a
                  href={`tel:${SUPPORT_PHONE_E164}`}
                  className="transition-colors hover:text-foreground"
                >
                  {SUPPORT_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{SUPPORT_LOCATION}</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="mb-4 text-sm font-semibold text-foreground">{category}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => {
                    const isInternal = link.href.startsWith("/") && !link.href.startsWith("//")
                    return (
                      <li key={link.label}>
                        {isInternal ? (
                          <Link
                            href={link.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} LogiScout. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
