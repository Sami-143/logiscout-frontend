"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  GitBranch,
  Copy,
  Check,
  Loader2,
  Info,
  Save,
  ExternalLink,
} from "lucide-react"
import { projectAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("WebhookConfiguration")

interface WebhookConfigurationProps {
  projectId: string
  projectName: string
  webhookBaseUrl: string | null
  onBaseUrlSaved: (url: string) => void
}

export function WebhookConfiguration({
  projectId,
  projectName,
  webhookBaseUrl,
  onBaseUrlSaved,
}: WebhookConfigurationProps) {
  const [baseUrl, setBaseUrl] = useState(webhookBaseUrl || "")
  const [saving, setSaving] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)
  const { toast } = useToast()

  const savedUrl = webhookBaseUrl || ""
  const hasUnsavedChanges = baseUrl.trim() !== savedUrl
  const webhookUrl = savedUrl
    ? `${savedUrl.replace(/\/+$/, "")}/api/v1/webhook/${projectId}/github`
    : ""

  const handleSave = async () => {
    const trimmed = baseUrl.trim().replace(/\/+$/, "")
    if (!trimmed) {
      toast({ title: "Error", description: "Please enter a valid URL", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const res = await projectAPI.update(projectId, { webhook_base_url: trimmed })
      if (res.success) {
        onBaseUrlSaved(trimmed)
        log.info({ projectId, url: trimmed }, "Webhook base URL saved")
        toast({ title: "Saved", description: "Webhook URL configuration saved" })
      }
    } catch {
      log.error({ projectId }, "Failed to save webhook base URL")
      toast({ title: "Error", description: "Failed to save webhook configuration", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">GitHub Webhook</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect a GitHub repository to{" "}
          <span className="font-medium text-foreground">{projectName}</span> to
          automatically track commits and changes.
        </p>
      </div>

      {/* Info card */}
      <Card className="p-4 border-blue-500/20 bg-blue-500/5">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">How it works</p>
            <p className="text-xs text-muted-foreground mt-1">
              When you add a webhook to your GitHub repository, GitHub sends a
              request to your Ingestion Server every time a push event occurs.
              The server processes the commits and generates AI-powered summaries
              of the changes.
            </p>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Step 1: Configure base URL */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono">
            Step 1
          </Badge>
          <h3 className="text-base font-semibold text-foreground">
            Ingestion Server URL
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your Ingestion Server&apos;s public URL. If running locally, use
          your ngrok URL (e.g.{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
            https://abc123.ngrok-free.dev
          </code>
          ).
        </p>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="webhook-base-url" className="sr-only">
              Ingestion Server URL
            </Label>
            <Input
              id="webhook-base-url"
              placeholder="https://your-server.ngrok-free.dev"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="font-mono text-sm"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Step 2: Webhook URL (shown after saving) */}
      {savedUrl && (
        <>
          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                Step 2
              </Badge>
              <h3 className="text-base font-semibold text-foreground">
                Your Webhook URL
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Copy this URL and add it to your GitHub repository&apos;s webhook
              settings.
            </p>

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
          </div>

          <Separator />

          {/* Step 3: Webhook Secret */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                Step 3
              </Badge>
              <h3 className="text-base font-semibold text-foreground">
                Webhook Secret
              </h3>
            </div>
            <Card className="p-4 border-amber-500/20 bg-amber-500/5">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Where to find your secret
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono">
                      GITHUB_WEBHOOK_SECRET
                    </code>{" "}
                    value from your Ingestion Server&apos;s{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono">
                      .env
                    </code>{" "}
                    file. This secret is used to verify that webhook requests
                    are genuinely from GitHub.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Step 4: GitHub Setup Instructions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                Step 4
              </Badge>
              <h3 className="text-base font-semibold text-foreground">
                Add Webhook to GitHub
              </h3>
            </div>

            <Card className="p-5 space-y-4">
              <ol className="space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    1
                  </span>
                  <span>
                    Go to your GitHub repository &rarr;{" "}
                    <span className="font-medium text-foreground">Settings</span>{" "}
                    &rarr;{" "}
                    <span className="font-medium text-foreground">Webhooks</span>{" "}
                    &rarr;{" "}
                    <span className="font-medium text-foreground">
                      Add webhook
                    </span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    2
                  </span>
                  <span>
                    Paste the <span className="font-medium text-foreground">Webhook URL</span>{" "}
                    above into the{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">
                      Payload URL
                    </code>{" "}
                    field
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    3
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
                    4
                  </span>
                  <span>
                    Paste your{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">
                      GITHUB_WEBHOOK_SECRET
                    </code>{" "}
                    into the{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">
                      Secret
                    </code>{" "}
                    field
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    5
                  </span>
                  <span>
                    Under{" "}
                    <span className="font-medium text-foreground">
                      &quot;Which events would you like to trigger this
                      webhook?&quot;
                    </span>
                    , select{" "}
                    <span className="font-medium text-foreground">
                      &quot;Just the push event&quot;
                    </span>{" "}
                    or choose specific events like push and pull request
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    6
                  </span>
                  <span>
                    Ensure{" "}
                    <span className="font-medium text-foreground">Active</span>{" "}
                    is checked, then click{" "}
                    <span className="font-medium text-foreground">
                      &quot;Add webhook&quot;
                    </span>
                  </span>
                </li>
              </ol>
            </Card>

            <Card className="p-4 border-green-500/20 bg-green-500/5">
              <div className="flex gap-3">
                <GitBranch className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Verification
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    After adding the webhook, GitHub will send a{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono">
                      ping
                    </code>{" "}
                    event. Check your Ingestion Server logs to confirm it was
                    received. Then push a commit to see it appear in your
                    project&apos;s activity timeline.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
