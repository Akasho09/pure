"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Users, CreditCard, Gift, BarChart3,
  Settings, LogOut, Menu, X, Moon, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/families", label: "Families", icon: Users },
  { href: "/contributions", label: "Contributions", icon: CreditCard },
  { href: "/donations", label: "Donations", icon: Gift },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin", label: "Admin Panel", icon: Settings, adminOnly: true },
]

interface SidebarProps {
  isAdmin: boolean
  adminName?: string
}

export function Sidebar({ isAdmin, adminName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    toast({ title: "Logged out", description: "You have been logged out." })
    router.push("/login")
    router.refresh()
  }

  const filteredNav = navItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-[hsl(var(--sidebar-bg))] border-b border-[hsl(var(--sidebar-border))] lg:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕌</span>
          <span className="font-display font-bold text-[hsl(var(--sidebar-fg))] text-lg">Masjid CMS</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="text-[hsl(var(--sidebar-fg))]">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300",
        "bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]",
        "lg:translate-x-0 lg:z-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-lg shadow-md">
            🕌
          </div>
          <div>
            <p className="font-display font-bold text-[hsl(var(--sidebar-fg))] leading-tight">Masjid CMS</p>
            <p className="text-[10px] text-[hsl(var(--sidebar-muted))] uppercase tracking-wider">Committee System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {filteredNav.map(({ href, label, icon: Icon, adminOnly }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-hover))]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {adminOnly && (
                  <span className="text-[9px] uppercase tracking-wider bg-emerald-700/30 text-emerald-300 px-1.5 py-0.5 rounded">Admin</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[hsl(var(--sidebar-border))]">
          {isAdmin ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {adminName?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[hsl(var(--sidebar-fg))] truncate">{adminName || "Admin"}</p>
                  <p className="text-[10px] text-[hsl(var(--sidebar-muted))]">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[hsl(var(--sidebar-muted))] hover:text-red-400 hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Admin Login</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
