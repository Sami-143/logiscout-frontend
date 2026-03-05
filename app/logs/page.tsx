import { DashboardLayout, LiveLogs } from "@/components/dashboard"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function LogsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="h-[calc(100vh-4rem)]">
          <LiveLogs />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
