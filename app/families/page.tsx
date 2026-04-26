"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, Users, ChevronRight, Phone, MapPin } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { StatusBadge } from "@/components/layout/StatusBadge"
import { AddFamilyModal } from "@/components/forms/AddFamilyModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency, getCurrentMonth, formatMonth } from "@/lib/utils"
import { useAuth } from "@/components/layout/AuthProvider"

interface FamilyRow {
  id: string
  familyName: string
  address?: string | null
  phone?: string | null
  memberCount: number
  monthlyDue: number
  currentContribution?: { status: string; paidAmount: number; amount: number } | null
}

export default function FamiliesPage() {
  const { isAdmin } = useAuth()
  const [families, setFamilies] = useState<FamilyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const currentMonth = getCurrentMonth()

  const fetchFamilies = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), limit: "15" })
    if (search) params.set("search", search)
    const res = await fetch(`/api/family?${params}`)
    const json = await res.json()
    setFamilies(json.data || [])
    setTotalPages(json.totalPages || 1)
    setLoading(false)
  }, [page, search])

  useEffect(() => { fetchFamilies() }, [fetchFamilies])
  useEffect(() => { setPage(1) }, [search])

  return (
    <div className="p-6 lg:p-8 space-y-6 page-enter">
      <PageHeader
        title="Families"
        description={`All registered families — ${formatMonth(currentMonth)}`}
        action={isAdmin ? (
          <Button onClick={() => setShowAdd(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" /> Add Family
          </Button>
        ) : undefined}
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search families..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Family Cards */}
      {loading ? (
        <div className="grid gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : families.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No families found</p>
          {search && <p className="text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid gap-3">
          {families.map(family => (
            <Link key={family.id} href={`/families/${family.id}`}>
              <div className="bg-card border rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-display font-bold text-sm shrink-0">
                    {family.familyName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground group-hover:text-emerald-700 transition-colors">
                        {family.familyName}
                      </p>
                      {family.currentContribution ? (
                        <StatusBadge status={family.currentContribution.status} />
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-500 border-gray-200">
                          No record
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {family.memberCount} members
                      </span>
                      {family.address && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="h-3 w-3 shrink-0" /> {family.address}
                        </span>
                      )}
                      {family.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {family.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Due amount */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs text-muted-foreground">Monthly Due</p>
                    <p className="font-bold text-foreground">{formatCurrency(family.monthlyDue)}</p>
                    {family.currentContribution && family.currentContribution.paidAmount > 0 && (
                      <p className="text-xs text-emerald-600">
                        Paid: {formatCurrency(family.currentContribution.paidAmount)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}

      <AddFamilyModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={fetchFamilies}
      />
    </div>
  )
}
