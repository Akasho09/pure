"use client"
import { useAuth } from "./AuthProvider"
import { Sidebar } from "./Sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAdmin, admin } = useAuth()
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isAdmin={isAdmin} adminName={admin?.name} />
      {/* Main content area */}
      <main className="flex-1 lg:ml-64 min-h-screen min-w-0 overflow-x-hidden">
        <div className="pt-14 lg:pt-0 min-h-screen w-full">{children}</div>
      </main>
    </div>
  )
}
