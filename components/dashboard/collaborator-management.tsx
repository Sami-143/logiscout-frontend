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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import {
  Users,
  UserPlus,
  Trash2,
  Loader2,
  Mail,
  Eye,
  Edit3,
  Crown,
  Clock,
  CheckCircle2,
  Info,
} from "lucide-react"
import { projectAPI, type CollaboratorData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("CollaboratorManagement")

interface CollaboratorManagementProps {
  projectId: string
  projectName: string
  /** Current user's role on this project. Non-owners see read-only UI. */
  currentUserRole?: "owner" | "edit" | "read"
}

export function CollaboratorManagement({
  projectId,
  projectName,
  currentUserRole = "owner",
}: CollaboratorManagementProps) {
  const isOwner = currentUserRole === "owner"
  const [collaborators, setCollaborators] = useState<CollaboratorData[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"read" | "edit">("read")
  const [inviting, setInviting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCollaborators = useCallback(async () => {
    if (!isOwner) {
      // Non-owners shouldn't request the list; backend returns 404.
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await projectAPI.listCollaborators(projectId)
      if (res.success && res.data) {
        setCollaborators(res.data)
        log.info({ projectId, count: res.data.length }, "Collaborators loaded")
      }
    } catch {
      log.error({ projectId }, "Failed to load collaborators")
      toast({
        title: "Error",
        description: "Failed to load collaborators",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [projectId, isOwner, toast])

  useEffect(() => {
    fetchCollaborators()
  }, [fetchCollaborators])

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase()
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter the email of an existing LogiScout user.",
        variant: "destructive",
      })
      return
    }
    setInviting(true)
    try {
      const res = await projectAPI.inviteCollaborator(projectId, {
        email,
        role: inviteRole,
      })
      if (res.success) {
        log.info({ projectId, email, role: inviteRole }, "Collaborator invited")
        toast({
          title: "Invitation sent",
          description: `${email} has been invited as a ${
            inviteRole === "edit" ? "Editor" : "Viewer"
          }.`,
        })
        setDialogOpen(false)
        setInviteEmail("")
        setInviteRole("read")
        await fetchCollaborators()
      }
    } catch (err: unknown) {
      // Backend wraps errors as { detail: { success, message } } via HTTPException.
      // Read both shapes so the user sees the real reason.
      const e = err as {
        response?: {
          data?: {
            message?: string
            detail?: { message?: string } | string
          }
        }
        message?: string
      }
      const data = e?.response?.data
      const detailMsg =
        typeof data?.detail === "string"
          ? data.detail
          : data?.detail?.message
      const errorMsg =
        data?.message || detailMsg || e?.message || "Failed to send invitation"
      log.error({ projectId, email, errorMsg }, "Invite failed")
      toast({
        title: "Could not invite",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (
    collaboratorId: string,
    newRole: "read" | "edit"
  ) => {
    setUpdatingId(collaboratorId)
    try {
      const res = await projectAPI.updateCollaboratorRole(
        projectId,
        collaboratorId,
        { role: newRole }
      )
      if (res.success) {
        setCollaborators((prev) =>
          prev.map((c) =>
            c.id === collaboratorId ? { ...c, role: newRole } : c
          )
        )
        log.info({ projectId, collaboratorId, newRole }, "Role updated")
        toast({ title: "Role updated", description: "Access level changed." })
      }
    } catch {
      log.error({ projectId, collaboratorId }, "Role update failed")
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (collaboratorId: string) => {
    setRemovingId(collaboratorId)
    try {
      const res = await projectAPI.removeCollaborator(projectId, collaboratorId)
      if (res.success) {
        setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId))
        log.info({ projectId, collaboratorId }, "Collaborator removed")
        toast({
          title: "Collaborator removed",
          description: "They no longer have access to this project.",
        })
      }
    } catch {
      log.error({ projectId, collaboratorId }, "Remove failed")
      toast({
        title: "Error",
        description: "Failed to remove collaborator",
        variant: "destructive",
      })
    } finally {
      setRemovingId(null)
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return iso
    }
  }

  // Non-owner read-only notice
  if (!isOwner) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Collaborator management is available to project owners only.
          </p>
        </div>
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                You have {currentUserRole === "edit" ? "Editor" : "Viewer"} access
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Only the project owner can invite, remove, or change roles for
                collaborators on <span className="font-medium">{projectName}</span>.
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Invite teammates to collaborate on{" "}
            <span className="font-medium text-foreground">{projectName}</span>.
            Collaborators must have a LogiScout account.
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setInviteEmail("")
              setInviteRole("read")
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Collaborator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Invite Collaborator</DialogTitle>
              <DialogDescription>
                Send an invitation to a registered LogiScout user. They&apos;ll
                receive an email with a link to accept.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="teammate@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !inviting && handleInvite()
                    }
                    className="pl-9"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  The user must already have a LogiScout account.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Access level</Label>
                <RadioGroup
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as "read" | "edit")}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="role-read"
                    className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                  >
                    <RadioGroupItem value="read" id="role-read" className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Viewer (read-only)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Can view logs, analytics, and use AI chat. Cannot modify
                        the project.
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="role-edit"
                    className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                  >
                    <RadioGroupItem value="edit" id="role-edit" className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Editor</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Everything Viewers can do, plus update project name and
                        description. Cannot manage tokens or other collaborators.
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="gap-2"
              >
                {inviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Owner-only info */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Owner-only management
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Only the project owner can invite, remove, or change roles for
              collaborators. API tokens and webhook configuration remain
              owner-only regardless of collaborator role.
            </p>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Collaborator List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading collaborators...</p>
        </div>
      ) : collaborators.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-muted">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              No collaborators yet
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Invite teammates to share access to this project.
            </p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite First Collaborator
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Owner card (always shown first, non-removable) */}
          <Card className="p-4 border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-500/10">
                  <Crown className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">You</p>
                  <p className="text-xs text-muted-foreground">Project owner</p>
                </div>
              </div>
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
                Owner
              </Badge>
            </div>
          </Card>

          {/* Collaborators */}
          {collaborators.map((c) => (
            <Card key={c.id} className="p-4 border-border bg-card">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {c.name || c.email}
                      </p>
                      {c.status === "pending" ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] gap-1 border-amber-500/30 text-amber-600"
                        >
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] gap-1 border-green-500/30 text-green-600"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="truncate">{c.email}</span>
                      <span>·</span>
                      <span>Invited {formatDate(c.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select
                    value={c.role}
                    onValueChange={(v) =>
                      handleRoleChange(c.id, v as "read" | "edit")
                    }
                    disabled={updatingId === c.id}
                  >
                    <SelectTrigger className="h-8 w-[110px] text-xs">
                      {updatingId === c.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5" />
                          Viewer
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-3.5 w-3.5" />
                          Editor
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={removingId === c.id}
                      >
                        {removingId === c.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove collaborator?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <span className="font-medium">{c.email}</span> will
                          immediately lose access to this project. They can be
                          re-invited later if needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemove(c.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
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
