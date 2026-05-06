"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  Check,
  X,
  Loader2,
  Inbox,
  FolderOpen,
  Edit3,
  Eye,
} from "lucide-react"
import { projectAPI, type InvitationData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { createLogger } from "@/lib/logger"

const log = createLogger("NotificationsBell")

const POLL_INTERVAL_MS = 30_000

interface NotificationsBellProps {
  /** Called after a successful accept so the parent can refresh project data. */
  onInvitationAccepted?: () => void
}

export function NotificationsBell({
  onInvitationAccepted,
}: NotificationsBellProps) {
  const [open, setOpen] = useState(false)
  const [invitations, setInvitations] = useState<InvitationData[]>([])
  const [loading, setLoading] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true)
      const res = await projectAPI.listInvitations()
      if (res.success && res.data) {
        setInvitations(res.data)
        log.debug({ count: res.data.length }, "Invitations loaded")
      }
    } catch {
      log.error("Failed to fetch invitations")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load + polling
  useEffect(() => {
    fetchInvitations()
    const id = window.setInterval(fetchInvitations, POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [fetchInvitations])

  // Refresh when popover opens
  useEffect(() => {
    if (open) fetchInvitations()
  }, [open, fetchInvitations])

  const handleAccept = async (invite: InvitationData) => {
    setActingId(invite.id)
    try {
      const res = await projectAPI.acceptInvitation(invite.id)
      if (res.success) {
        log.info(
          { invitationId: invite.id, projectId: invite.project_id },
          "Invitation accepted"
        )
        toast({
          title: "Invitation accepted",
          description: `You now have ${
            invite.role === "edit" ? "Editor" : "Viewer"
          } access to ${invite.project_name}.`,
        })
        setInvitations((prev) => prev.filter((i) => i.id !== invite.id))
        onInvitationAccepted?.()
      }
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string; detail?: { message?: string } } }
      }
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail?.message ||
        "Could not accept invitation"
      log.error({ invitationId: invite.id }, "Accept failed")
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setActingId(null)
    }
  }

  const handleDecline = async (invite: InvitationData) => {
    setActingId(invite.id)
    try {
      const res = await projectAPI.declineInvitation(invite.id)
      if (res.success) {
        log.info({ invitationId: invite.id }, "Invitation declined")
        toast({
          title: "Invitation declined",
          description: `You declined the invite to ${invite.project_name}.`,
        })
        setInvitations((prev) => prev.filter((i) => i.id !== invite.id))
      }
    } catch {
      log.error({ invitationId: invite.id }, "Decline failed")
      toast({
        title: "Error",
        description: "Could not decline invitation",
        variant: "destructive",
      })
    } finally {
      setActingId(null)
    }
  }

  const formatRelative = (iso: string) => {
    try {
      const d = new Date(iso).getTime()
      const diff = Date.now() - d
      const mins = Math.floor(diff / 60_000)
      if (mins < 1) return "just now"
      if (mins < 60) return `${mins}m ago`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs}h ago`
      const days = Math.floor(hrs / 24)
      if (days < 7) return `${days}d ago`
      return new Date(iso).toLocaleDateString()
    } catch {
      return ""
    }
  }

  const count = invitations.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {count > 0
                ? `${count} pending project invitation${count === 1 ? "" : "s"}`
                : "You're all caught up"}
            </p>
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <Separator />

        <div className="max-h-[420px] overflow-y-auto">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-muted mb-3">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No new invitations</p>
              <p className="text-xs text-muted-foreground mt-1">
                When someone invites you to a project, it will show up here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {invitations.map((invite) => {
                const RoleIcon = invite.role === "edit" ? Edit3 : Eye
                const acting = actingId === invite.id
                return (
                  <div key={invite.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 flex-shrink-0">
                        <FolderOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm text-foreground leading-snug">
                          <span className="font-semibold">
                            {invite.inviter_name}
                          </span>{" "}
                          invited you to{" "}
                          <span className="font-semibold">
                            {invite.project_name || "a project"}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[10px] gap-1 border-blue-500/30 text-blue-600"
                          >
                            <RoleIcon className="h-3 w-3" />
                            {invite.role === "edit" ? "Editor" : "Viewer"}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {formatRelative(invite.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 gap-1.5"
                        onClick={() => handleAccept(invite)}
                        disabled={acting}
                      >
                        {acting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 gap-1.5"
                        onClick={() => handleDecline(invite)}
                        disabled={acting}
                      >
                        <X className="h-3.5 w-3.5" />
                        Decline
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
