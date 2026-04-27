"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  GitBranch,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  AlertCircle,
} from "lucide-react"
import { projectAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("WebhookConfiguration")

interface WebhookConfigurationProps {
  projectId: string
  projectName: string
}

export function WebhookConfiguration({
  projectId,
  projectName,
}: WebhookConfigurationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlCopied, setUrlCopied] = useState(false)
  const [fetchedForProject, setFetchedForProject] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!isOpen || fetchedForProject === projectId) return

    const fetchUrl = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await projectAPI.getWebhookUrl(projectId)
        if (res.success && res.data) {
          setWebhookUrl(res.data.webhookUrl)
          setFetchedForProject(projectId)
          log.info({ projectId }, "Webhook URL fetched")
        } else {
          setError(res.message || "Failed to fetch webhook URL")
        }
      } catch {
        log.error({ projectId }, "Failed to fetch webhook URL")
        setError("Failed to fetch webhook URL")
      } finally {
        setLoading(false)
      }
    }

    fetchUrl()
  }, [isOpen, projectId, fetchedForProject])

  useEffect(() => {
    setFetchedForProject(null)
    setWebhookUrl(null)
  }, [projectId])

  const handleCopyUrl = async () => {
    if (!webhookUrl) return
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setUrlCopied(true)
      toast({ title: "Copied", description: "Webhook URL copied to clipboard" })
      setTimeout(() => setUrlCopied(false), 2000)
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" })
    }
  }

  const handleRetry = () => {
    setFetchedForProject(null)
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">GitHub Webhook</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect a GitHub repository to{" "}
          <span className="font-medium text-foreground">{projectName}</span> to
          automatically track commits and changes.
        </p>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Connect to GitHub
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="mt-4 p-5 space-y-5">
            {/* Webhook URL section */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Webhook URL
              </h3>
              <p className="text-sm text-muted-foreground">
                Copy this URL and add it to your GitHub repository&apos;s
                webhook settings.
              </p>

              {loading && (
                <div className="flex items-center gap-2 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Fetching webhook URL...
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md border border-destructive/20 bg-destructive/5">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-sm text-destructive flex-1">{error}</span>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    Retry
                  </Button>
                </div>
              )}

              {webhookUrl && !loading && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      readOnly
                      value={webhookUrl}
                      className="font-mono text-xs bg-muted/50"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyUrl}
                    className="flex-shrink-0"
                  >
                    {urlCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Step-by-step GitHub setup instructions */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Setup Instructions
              </h3>

              <ol className="space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    1
                  </span>
                  <span>
                    Go to your GitHub repository &rarr;{" "}
                    <span className="font-medium text-foreground">Settings</span>{" "}
                    &rarr;{" "}
                    <span className="font-medium text-foreground">Webhooks</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    2
                  </span>
                  <span>
                    Click{" "}
                    <span className="font-medium text-foreground">
                      &quot;Add webhook&quot;
                    </span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    3
                  </span>
                  <span>
                    Paste the copied URL into the{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">
                      Payload URL
                    </code>{" "}
                    field
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    4
                  </span>
                  <span>
                    Set{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">
                      Content type
                    </code>{" "}
                    to{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">
                      application/json
                    </code>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    5
                  </span>
                  <span>
                    Choose the events to trigger the webhook (e.g.,{" "}
                    <span className="font-medium text-foreground">push</span>,{" "}
                    <span className="font-medium text-foreground">
                      pull request
                    </span>
                    )
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    6
                  </span>
                  <span>
                    Click{" "}
                    <span className="font-medium text-foreground">
                      &quot;Add Webhook&quot;
                    </span>
                  </span>
                </li>
              </ol>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
