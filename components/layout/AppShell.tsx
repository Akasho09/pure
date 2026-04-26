"use client"
import { useAuth } from "./AuthProvider"
import { Sidebar } from "./Sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAdmin, admin } = useAuth()
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isAdmin={isAdmin} adminName={admin?.name} />
      {/* Main content area */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
