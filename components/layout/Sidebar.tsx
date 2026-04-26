"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Users, CreditCard, Gift,
  BarChart3, Settings, LogOut, Menu, X
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

export function Sidebar({ isAdmin, adminName }: any) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    toast({ title: "Logged out" })
    router.push("/login")
  }

  const filteredNav = navItems.filter(i => !i.adminOnly || isAdmin)

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 lg:hidden">
        <div className="flex items-center gap-2">
          <img src="/masjid-icon.jpg" className="w-6 h-6 rounded" />
          <span className="text-white font-semibold">Masjid CMS</span>
        </div>

        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
          {open ? <X className="text-white" /> : <Menu className="text-white" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300",
          "bg-slate-900 border-r border-slate-800",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <img
            src="/masjid-icon.jpg"
            className="w-10 h-10 rounded-lg object-contain"
          />

          <div>
            <p className="text-white font-bold">Masjid CMS</p>
            <p className="text-xs text-slate-400">Committee System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredNav.map(({ href, label, icon: Icon, adminOnly }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href))

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{label}</span>

                {adminOnly && (
                  <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-800">
          {isAdmin ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                  {adminName?.[0] || "A"}
                </div>

                <div>
                  <p className="text-sm text-white">{adminName}</p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              <Settings className="h-4 w-4" />
              Admin Login
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}