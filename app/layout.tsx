import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/layout/AuthProvider"
import { AppShell } from "@/components/layout/AppShell"

export const metadata: Metadata = {
  title: "Masjid Committee Management System",
  description: "Manage village masjid finances, families, and contributions",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
