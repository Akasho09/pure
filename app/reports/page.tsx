"use client"

import { useEffect, useState, useCallback } from "react"
import { Download } from "lucide-react"

import { PageHeader } from "@/components/layout/PageHeader"
import { StatusBadge, DonationTypeBadge } from "@/components/layout/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { formatCurrency, formatMonth, exportToCSV } from "@/lib/utils"

// ✅ CONSTANTS (FIXED)
const MONTHS = [
  { value: "all", label: "All Months" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

const currentYear = new Date().getFullYear()

const YEARS = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}))

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [filterMonth, setFilterMonth] = useState("all")
  const [filterYear, setFilterYear] = useState(String(currentYear))

  const [activeTab, setActiveTab] = useState<"contributions" | "donations">("contributions")

  // ✅ FETCH LOGIC
  const fetchReport = useCallback(async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()

      if (filterYear) {
        params.set("year", filterYear)
      }

      if (filterMonth !== "all") {
        params.set("month", filterMonth)
      }

      const res = await fetch(`/api/report?${params.toString()}`)
      const json = await res.json()

      setData(json.data)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [filterMonth, filterYear])

  // ✅ DEBOUNCE
  useEffect(() => {
    const timeout = setTimeout(fetchReport, 300)
    return () => clearTimeout(timeout)
  }, [fetchReport])

  // ✅ EXPORT
  const handleExport = () => {
    if (!data) return

    if (activeTab === "contributions") {
      exportToCSV(
        data.contributions.map((c: any) => ({
          Family: c.family?.familyName || "",
          Month: c.month,
          Members: c.family?._count?.members || "",
          "Amount Due": c.amount,
          "Amount Paid": c.paidAmount,
          Status: c.status,
          Note: c.note || "",
        })),
        `report-contributions-${filterYear}${filterMonth !== "all" ? `-${filterMonth}` : ""}`
      )
    } else {
      exportToCSV(
        data.donations.map((d: any) => ({
          Donor: d.donorName || "Anonymous",
          Family: d.family?.familyName || "",
          Amount: d.amount,
          Type: d.type,
          Note: d.note || "",
        })),
        `report-donations-${filterYear}${filterMonth !== "all" ? `-${filterMonth}` : ""}`
      )
    }
  }

  const summary = data?.summary

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* HEADER */}
      <PageHeader
        title="Financial Report"
        description="Monthly and yearly overview"
        action={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        }
      />

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap">

        {/* MONTH */}
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* YEAR */}
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y.value} value={y.value}>
                {y.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* LOADING */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : summary && (
        <>
          {/* TABS */}
          <div className="flex gap-2 border-b">
            {(["contributions", "donations"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm border-b-2 ${
                  activeTab === tab
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TABLE */}
          <Card>
            <CardContent className="p-0">

              {activeTab === "contributions" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Family</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.contributions.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.family?.familyName}</TableCell>
                        <TableCell>{formatMonth(c.month)}</TableCell>
                        <TableCell>{c.family?._count?.members || 0}</TableCell>
                        <TableCell>{formatCurrency(c.amount)}</TableCell>
                        <TableCell>{formatCurrency(c.paidAmount)}</TableCell>
                        <TableCell><StatusBadge status={c.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Family</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.donations.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.donorName || "Anonymous"}</TableCell>
                        <TableCell>{d.family?.familyName || "—"}</TableCell>
                        <TableCell>{formatCurrency(d.amount)}</TableCell>
                        <TableCell><DonationTypeBadge type={d.type} /></TableCell>
                        <TableCell>{d.note || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}