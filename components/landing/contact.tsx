"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react"
import { notify } from "@/lib/notify"
import { createLogger } from "@/lib/logger"
import { sendContactEmail, EmailJSConfigError } from "@/lib/emailjs"
import { SectionHeading } from "./section-heading"
import { FadeIn } from "./animations"

const log = createLogger("LandingContact")

const SUPPORT_EMAIL = "logiscoutai@gmail.com"
const SUPPORT_PHONE = "03477586056"
const SUPPORT_PHONE_E164 = "+923477586056"
const SUPPORT_LOCATION = "Lahore, Pakistan"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

const EMPTY_FORM: FormState = { name: "", email: "", subject: "", message: "" }

export function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [sending, setSending] = useState(false)

  const update = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return

    const name = form.name.trim()
    const email = form.email.trim()
    const subject = form.subject.trim()
    const message = form.message.trim()

    if (!name) return notify.error("Name required", "Please tell us who you are.")
    if (!EMAIL_RE.test(email)) return notify.error("Invalid email", "Please enter a valid email so we can reply.")
    if (!subject) return notify.error("Subject required", "Add a short subject for your message.")
    if (message.length < 10) return notify.error("Message too short", "A few more words please — at least 10 characters.")

    setSending(true)
    try {
      await sendContactEmail({ name, email, subject, message })
      notify.success("Message sent", `Thanks ${name.split(" ")[0]} — we'll reply within one working day.`)
      setForm(EMPTY_FORM)
    } catch (err) {
      if (err instanceof EmailJSConfigError) {
        log.error({ err }, "EmailJS not configured")
        notify.error(
          "Contact form not configured",
          `Please email us directly at ${SUPPORT_EMAIL}.`,
        )
      } else {
        log.error({ err }, "EmailJS send failed")
        notify.error(
          "Couldn't send your message",
          `Something went wrong. Try again, or email ${SUPPORT_EMAIL} directly.`,
        )
      }
    } finally {
      setSending(false)
    }
  }

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL)
      notify.success("Copied", "Our email address is on your clipboard.")
    } catch {
      notify.error("Couldn't copy", "Your browser blocked the clipboard write.")
    }
  }

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/4 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-accent/5 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to the LogiScout team"
          subtitle="Questions about onboarding, pricing, or a custom integration? Drop us a line and we'll get back to you within one working day."
          className="mb-16"
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <FadeIn direction="up" className="lg:col-span-2">
            <Card className="flex h-full flex-col gap-6 border-border bg-card p-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Reach us directly</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prefer email or a phone call? Use the details below — we read every message.
                </p>
              </div>

              <ul className="flex flex-col gap-5">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="break-all text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${SUPPORT_PHONE_E164}`}
                      className="mt-0.5 block text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {SUPPORT_PHONE}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{SUPPORT_LOCATION}</p>
                  </div>
                </li>
              </ul>

              <div className="mt-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
                We&rsquo;re a small, focused team — your message goes straight to an engineer, not a ticket queue.
              </div>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={0.1} className="lg:col-span-3">
            <Card className="border-border bg-card p-8">
              <form onSubmit={handleSubmit} className="space-y-5" aria-label="Contact form" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="text-sm font-medium">
                      Name
                    </Label>
                    <Input
                      id="contact-name"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={update("name")}
                      disabled={sending}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={update("email")}
                      disabled={sending}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-subject" className="text-sm font-medium">
                    Subject
                  </Label>
                  <Input
                    id="contact-subject"
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={update("subject")}
                    disabled={sending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-sm font-medium">
                    Message
                  </Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us a bit about what you're working on…"
                    value={form.message}
                    onChange={update("message")}
                    disabled={sending}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your message is delivered straight to our inbox — we don&rsquo;t store it anywhere else.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 sm:w-auto"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Send message
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
