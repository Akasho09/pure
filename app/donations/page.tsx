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

/* ---------------- TYPES ---------------- */

type DonationType = "sadaqah" | "zakat" | "fitrah" | "other"

interface Family {
  id: string
  familyName: string
}

interface Donation {
  id: string
  donorName?: string | null
  amount: number
  type: DonationType
  note?: string | null
  createdAt: string
  familyId?: string | null
  family?: Family | null
}

interface DonationResponse {
  data: Donation[]
  total: number
}

interface FamilyResponse {
  data: Family[]
}

/* ---------------- COMPONENT ---------------- */

export default function DonationsPage() {
  const { isAdmin } = useAuth()

  const [donations, setDonations] = useState<Donation[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [filterType, setFilterType] = useState<"all" | DonationType>("all")
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)
  const [showAdd, setShowAdd] = useState<boolean>(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      })

      if (filterType !== "all") {
        params.set("type", filterType)
      }

      const [dRes, fRes] = await Promise.all([
        fetch(`/api/donation?${params}`),
        fetch("/api/family?limit=100")
      ])

      const dJson: DonationResponse = await dRes.json()
      const fJson: FamilyResponse = await fRes.json()

      setDonations(dJson.data || [])
      setTotal(dJson.total || 0)
      setFamilies(fJson.data || [])
    } catch (err) {
      console.error("Error fetching donations:", err)
    } finally {
      setLoading(false)
    }
  }, [page, filterType])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [filterType])

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)

  const handleExport = () => {
    exportToCSV(
      donations.map(d => ({
        Donor: d.donorName || "Anonymous",
        Family: d.family?.familyName || "",
        Amount: d.amount,
        Type: d.type,
        Note: d.note || "",
        Date: formatDate(d.createdAt),
      })),
      "donations"
    )
  }

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Donations"
          description="Zakat, Sadaqah, Fitrah and other contributions"
        />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>

          {isAdmin && (
            <Button
              onClick={() => setShowAdd(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Donation
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
          <SelectTrigger className="w-full sm:w-40">
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
          {total} records ·{" "}
          <span className="font-semibold text-emerald-700">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : donations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No donations found
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[650px]">
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
                      <TableCell className="font-medium break-words">
                        {d.donorName || (
                          <span className="text-muted-foreground italic">
                            Anonymous
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {d.family ? (
                          <Link
                            href={`/families/${d.familyId}`}
                            className="hover:text-emerald-700"
                          >
                            {d.family.familyName}
                          </Link>
                        ) : "—"}
                      </TableCell>

                      <TableCell className="font-semibold text-emerald-700 whitespace-nowrap">
                        {formatCurrency(d.amount)}
                      </TableCell>

                      <TableCell>
                        <DonationTypeBadge type={d.type} />
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                        {d.note || "—"}
                      </TableCell>

                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(d.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {Math.ceil(total / 20) > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / 20)}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
          >
            Next
          </Button>
        </div>
      )}

      <AddDonationModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={fetchData}
        families={families}
      />
    </div>
  )
}