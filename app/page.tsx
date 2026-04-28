"use client"

import { useEffect, useState } from "react"
import { Users, TrendingUp, AlertCircle, Gift, IndianRupee } from "lucide-react"
import { StatsCard } from "@/components/layout/StatsCard"
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardData {
  totalFamilies: number
  totalMembers: number
  totalCollectedMonth: number
  totalPendingMonth: number
  totalDonations: number
  recentTransactions: any[]
  currentMonth: string
  masjidName: string
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(j => {
        setData(j.data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 page-enter">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="arabic-decorative text-xl sm:text-2xl text-emerald-700 break-words">
              بِسْمِ اللَّهِ
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground break-words">
            {data.masjidName}
          </h1>

          <p className="text-sm text-muted-foreground">
            Dashboard — {formatMonth(data.currentMonth)}
          </p>
        </div>

        <div className="hidden sm:block text-right shrink-0">
          <p className="text-xs text-muted-foreground">Current Period</p>
          <p className="text-sm font-semibold text-foreground">
            {formatMonth(data.currentMonth)}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Total Families"
          value={data.totalFamilies}
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-blue-100 text-blue-700"
          subtitle="Registered families"
        />

        <StatsCard
          title="Total Members"
          value={data.totalMembers}
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-violet-100 text-violet-700"
          subtitle="Across all families"
        />

        <StatsCard
          title="Collected This Month"
          value={formatCurrency(data.totalCollectedMonth)}
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-emerald-100 text-emerald-700"
          subtitle="Monthly contributions"
        />

        <StatsCard
          title="Pending Dues"
          value={formatCurrency(data.totalPendingMonth)}
          icon={<AlertCircle className="h-5 w-5" />}
          iconBg="bg-red-100 text-red-700"
          subtitle="Outstanding this month"
        />

        <StatsCard
          title="Total Donations"
          value={formatCurrency(data.totalDonations)}
          icon={<Gift className="h-5 w-5" />}
          iconBg="bg-amber-100 text-amber-700"
          subtitle="All time donations"
        />
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Recent Transactions
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {data.recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <IndianRupee className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No transactions yet
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium text-sm break-words max-w-[180px]">
                        {tx.description}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground truncate max-w-[140px]">
                        {tx.familyName || "—"}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            tx.type === "donation"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {tx.type === "donation" ? "Donation" : "Contribution"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-semibold text-emerald-700 whitespace-nowrap">
                        {formatCurrency(tx.amount)}
                      </TableCell>

                      <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}