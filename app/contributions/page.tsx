"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus, Download, Filter } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { StatusBadge } from "@/components/layout/StatusBadge"
import { RecordContributionModal } from "@/components/forms/RecordContributionModal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatCurrency, formatMonth, getMonthOptions, exportToCSV, getCurrentMonth } from "@/lib/utils"
import { useAuth } from "@/components/layout/AuthProvider"
import Link from "next/link"

export default function ContributionsPage() {
  const { isAdmin } = useAuth()
  const [contributions, setContributions] = useState<any[]>([])
  const [families, setFamilies] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth())
  const [selectedFamily, setSelectedFamily] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const monthOptions = getMonthOptions(24)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [cRes, fRes, sRes] = await Promise.all([
      fetch(`/api/contribution?month=${filterMonth}`),
      fetch("/api/family?limit=100"),
      fetch("/api/settings"),
    ])
    const [cJson, fJson, sJson] = await Promise.all([cRes.json(), fRes.json(), sRes.json()])
    setContributions(cJson.data || [])
    setFamilies(fJson.data || [])
    setSettings(sJson.data)
    setLoading(false)
  }, [filterMonth])

  useEffect(() => { fetchData() }, [fetchData])

  const summary = {
    total: contributions.reduce((s, c) => s + c.amount, 0),
    collected: contributions.reduce((s, c) => s + c.paidAmount, 0),
    paid: contributions.filter(c => c.status === "paid").length,
    partial: contributions.filter(c => c.status === "partial").length,
    unpaid: contributions.filter(c => c.status === "unpaid").length,
  }

  const handleExport = () => {
    const rows = contributions.map(c => ({
      Family: c.family?.familyName || "",
      Month: c.month,
      Members: c.family?._count?.members || "",
      "Amount Due": c.amount,
      "Amount Paid": c.paidAmount,
      Status: c.status,
      Note: c.note || "",
    }))
    exportToCSV(rows, `contributions-${filterMonth}`)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 page-enter">
      <PageHeader
        title="Monthly Contributions"
        description="Track and manage monthly dues per family"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
          </div>
        }
      />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Due", value: formatCurrency(summary.total), color: "text-foreground" },
          { label: "Collected", value: formatCurrency(summary.collected), color: "text-emerald-700" },
          { label: "Pending", value: formatCurrency(summary.total - summary.collected), color: "text-red-600" },
          { label: "Paid / Partial / Unpaid", value: `${summary.paid} / ${summary.partial} / ${summary.unpaid}`, color: "text-foreground" },
        ].map(item => (
          <div key={item.label} className="bg-card border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={`text-lg font-display font-bold mt-0.5 ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : contributions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No contributions recorded for {formatMonth(filterMonth)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Family</TableHead>
                  <TableHead className="hidden sm:table-cell">Members</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="w-24">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/families/${c.familyId}`} className="font-medium hover:text-emerald-700 transition-colors">
                        {c.family?.familyName}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {c.family?._count?.members || 0}
                    </TableCell>
                    <TableCell>{formatCurrency(c.amount)}</TableCell>
                    <TableCell className="font-semibold text-emerald-700">{formatCurrency(c.paidAmount)}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button size="sm" variant="ghost" className="h-7 text-xs"
                          onClick={() => { setSelectedFamily(c.family); setShowModal(true) }}>
                          Update
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedFamily && settings && (
        <RecordContributionModal
          open={showModal}
          onClose={() => { setShowModal(false); setSelectedFamily(null) }}
          onSuccess={fetchData}
          familyId={selectedFamily.id}
          familyName={selectedFamily.familyName}
          memberCount={selectedFamily._count?.members || 0}
          amountPerMember={settings.amountPerMember}
        />
      )}
    </div>
  )
}
