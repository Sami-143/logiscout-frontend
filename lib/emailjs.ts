import emailjs from "@emailjs/browser"

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

interface EmailJSConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

export class EmailJSConfigError extends Error {
  constructor(missing: string[]) {
    super(`Missing EmailJS environment variables: ${missing.join(", ")}`)
    this.name = "EmailJSConfigError"
  }
}

function readConfig(): EmailJSConfig {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? ""
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? ""
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? ""

  const missing: string[] = []
  if (!serviceId) missing.push("NEXT_PUBLIC_EMAILJS_SERVICE_ID")
  if (!templateId) missing.push("NEXT_PUBLIC_EMAILJS_TEMPLATE_ID")
  if (!publicKey) missing.push("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY")

  if (missing.length > 0) {
    throw new EmailJSConfigError(missing)
  }

  return { serviceId, templateId, publicKey }
}

export function isEmailJSConfigured(): boolean {
  try {
    readConfig()
    return true
  } catch {
    return false
  }
}

export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const { serviceId, templateId, publicKey } = readConfig()

  await emailjs.send(
    serviceId,
    templateId,
    {
      from_name: payload.name,
      from_email: payload.email,
      reply_to: payload.email,
      subject: payload.subject,
      message: payload.message,
    },
    { publicKey },
  )
}
