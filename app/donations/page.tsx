"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus, Download } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { DonationTypeBadge } from "@/components/layout/StatusBadge"
import { AddDonationModal } from "@/components/forms/AddDonationModal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils"
import { useAuth } from "@/components/layout/AuthProvider"
import Link from "next/link"

export default function DonationsPage() {
  const { isAdmin } = useAuth()
  const [donations, setDonations] = useState<any[]>([])
  const [families, setFamilies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showAdd, setShowAdd] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), limit: "20" })
    if (filterType !== "all") params.set("type", filterType)
    const [dRes, fRes] = await Promise.all([
      fetch(`/api/donation?${params}`),
      fetch("/api/family?limit=100"),
    ])
    const [dJson, fJson] = await Promise.all([dRes.json(), fRes.json()])
    setDonations(dJson.data || [])
    setTotal(dJson.total || 0)
    setFamilies(fJson.data || [])
    setLoading(false)
  }, [page, filterType])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [filterType])

  const totalAmount = donations.reduce((s, d) => s + d.amount, 0)

  const handleExport = () => {
    exportToCSV(donations.map(d => ({
      Donor: d.donorName || "Anonymous",
      Family: d.family?.familyName || "",
      Amount: d.amount,
      Type: d.type,
      Note: d.note || "",
      Date: formatDate(d.createdAt),
    })), "donations")
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 page-enter">
      <PageHeader
        title="Donations"
        description="Zakat, Sadaqah, Fitrah and other contributions"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1.5" /> Export
            </Button>
            {isAdmin && (
              <Button onClick={() => setShowAdd(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" /> Add Donation
              </Button>
            )}
          </div>
        }
      />

      {/* Filters + Summary */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sadaqah">Sadaqah</SelectItem>
            <SelectItem value="zakat">Zakat</SelectItem>
            <SelectItem value="fitrah">Fitrah</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {total} records · <span className="font-semibold text-emerald-700">{formatCurrency(totalAmount)}</span> total shown
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : donations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No donations found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead className="hidden sm:table-cell">Family</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Note</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.donorName || <span className="text-muted-foreground italic">Anonymous</span>}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {d.family ? (
                        <Link href={`/families/${d.familyId}`} className="hover:text-emerald-700 transition-colors">
                          {d.family.familyName}
                        </Link>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-700">{formatCurrency(d.amount)}</TableCell>
                    <TableCell><DonationTypeBadge type={d.type} /></TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                      {d.note || "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{formatDate(d.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {Math.ceil(total / 20) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>Next</Button>
        </div>
      )}

      <AddDonationModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={fetchData} families={families} />
    </div>
  )
}
