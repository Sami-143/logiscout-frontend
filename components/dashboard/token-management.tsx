"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertTriangle,
  Clock,
  Shield,
  Eye,
  EyeOff,
  Ban,
  ShieldOff,
  Info,
} from "lucide-react"
import { projectAPI, type TokenData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("TokenManagement")

interface TokenManagementProps {
  projectId: string
  projectName: string
}

export function TokenManagement({ projectId, projectName }: TokenManagementProps) {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newLabel, setNewLabel] = useState("Default")
  const [creating, setCreating] = useState(false)
  const [disabling, setDisabling] = useState<string | null>(null)
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showNewToken, setShowNewToken] = useState(false)
  const { toast } = useToast()

  // Derived state
  const activeToken = tokens.find((t) => t.is_active)
  const hasActiveToken = !!activeToken
  // When an active token exists, hide disabled ones — they're not actionable
  // and just add noise. Show all tokens only when none are active so the user
  // can still see/revoke history if needed.
  const visibleTokens = hasActiveToken ? tokens.filter((t) => t.is_active) : tokens

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      const res = await projectAPI.listTokens(projectId)
      if (res.success && res.data) {
        setTokens(res.data)
        log.info({ projectId, count: res.data.length }, "Tokens loaded")
      }
    } catch {
      log.error({ projectId }, "Failed to load tokens")
      toast({ title: "Error", description: "Failed to load tokens", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [projectId, toast])

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await projectAPI.createToken(projectId, { label: newLabel.trim() || "Default" })
      if (res.success && res.data) {
        setNewTokenValue(res.data.token)
        setShowNewToken(true)
        log.info({ projectId, label: newLabel }, "Token created")
        // Refresh list
        await fetchTokens()
      }
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? ((err as Record<string, Record<string, Record<string, string>>>).response?.data?.message ??
            "Failed to create token")
          : "Failed to create token"
      log.error({ projectId }, "Failed to create token")
      toast({ title: "Error", description: errorMsg, variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const handleDisable = async (tokenId: string) => {
    setDisabling(tokenId)
    try {
      const res = await projectAPI.disableToken(projectId, tokenId)
      if (res.success) {
        log.info({ projectId, tokenId }, "Token disabled")
        toast({
          title: "Token Disabled",
          description: "The token has been disabled. You can now generate a new one.",
        })
        await fetchTokens()
      }
    } catch {
      log.error({ projectId, tokenId }, "Failed to disable token")
      toast({ title: "Error", description: "Failed to disable token", variant: "destructive" })
    } finally {
      setDisabling(null)
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast({ title: "Copied", description: "Token copied to clipboard" })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (tokenId: string) => {
    try {
      const res = await projectAPI.deleteToken(projectId, tokenId)
      if (res.success) {
        setTokens((prev) => prev.filter((t) => t.id !== tokenId))
        log.info({ projectId, tokenId }, "Token revoked")
        toast({ title: "Revoked", description: "Token has been revoked" })
      }
    } catch {
      log.error({ projectId, tokenId }, "Failed to revoke token")
      toast({ title: "Error", description: "Failed to revoke token", variant: "destructive" })
    }
  }

  const handleCloseNewToken = () => {
    setNewTokenValue(null)
    setShowNewToken(false)
    setNewLabel("Default")
    setDialogOpen(false)
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">API Tokens</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API tokens for <span className="font-medium text-foreground">{projectName}</span>.
            Tokens authenticate your LogiScout SDK to send logs.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) handleCloseNewToken()
        }}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-2"
              disabled={hasActiveToken}
              title={hasActiveToken ? "Disable the current active token before generating a new one" : undefined}
            >
              <Plus className="h-4 w-4" />
              Generate Token
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            {newTokenValue ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Token Created
                  </DialogTitle>
                  <DialogDescription>
                    Copy this token now. For security, it won&apos;t be shown again.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Make sure to copy your API token now. You won&apos;t be able to see it again!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Your API Token</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          readOnly
                          value={showNewToken ? newTokenValue : "•".repeat(40)}
                          className="font-mono text-xs pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowNewToken(!showNewToken)}
                        >
                          {showNewToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(newTokenValue)}
                        className="flex-shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCloseNewToken}>Done</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Generate API Token</DialogTitle>
                  <DialogDescription>
                    Create a new API token to authenticate log ingestion from your application.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-label">Label</Label>
                    <Input
                      id="token-label"
                      placeholder="e.g., Production, Staging, CI/CD"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                    <p className="text-xs text-muted-foreground">A label to help you identify this token later.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={creating} className="gap-2">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    Generate
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Active token enforcement notice */}
      {hasActiveToken && (
        <Card className="p-4 border-blue-500/20 bg-blue-500/5">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">One active token per project</p>
              <p className="text-xs text-muted-foreground mt-1">
                Each project can only have one active API token at a time. To generate a new token,
                you must first disable the current active token.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Token Security</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tokens are stored as SHA-256 hashes. The full token is only shown once at creation.
              If a token is compromised, disable it immediately and generate a new one.
            </p>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Token List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading tokens...</p>
        </div>
      ) : visibleTokens.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-muted">
            <Key className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">No API tokens yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate a token to start sending logs from your application.
            </p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Generate First Token
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleTokens.map((token) => (
            <Card
              key={token.id}
              className={`p-4 border-border bg-card ${!token.is_active ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                    token.is_active ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Key className={`h-5 w-5 ${token.is_active ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{token.label}</p>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {token.token_masked}
                      </Badge>
                      {token.is_active ? (
                        <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/10">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                          Disabled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {formatDate(token.created_at)}
                      </span>
                      {token.last_used_at && (
                        <span>Last used {formatDate(token.last_used_at)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Disable button — only for active tokens */}
                  {token.is_active && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-muted-foreground hover:text-amber-600"
                          disabled={disabling === token.id}
                        >
                          {disabling === token.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ShieldOff className="h-3.5 w-3.5" />
                          )}
                          <span className="text-xs">Disable</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disable Token</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disable the token{" "}
                            <span className="font-mono font-medium">{token.token_masked}</span>.
                            Any application using this token will lose access immediately.
                            You can then generate a new token for this project.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDisable(token.id)}
                            className="bg-amber-600 text-white hover:bg-amber-700"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Disable Token
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Delete button — for all tokens */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Token</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently revoke the token <span className="font-mono font-medium">{token.token_masked}</span>.
                          Any application using this token will lose access immediately. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(token.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revoke Token
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
