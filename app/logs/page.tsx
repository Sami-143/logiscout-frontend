import { DashboardLayout, LiveLogs } from "@/components/dashboard"

export default function LogsPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)]">
        <LiveLogs />
      </div>
    </DashboardLayout>
  )
}
