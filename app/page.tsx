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

const masjidImages = [
  "masjid-icon.jpg",
  "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f",
  "https://images.unsplash.com/photo-1578926375605-eaf7559b1458",
  "https://images.unsplash.com/photo-1609599006353-e629aaabfeae",
  "https://images.unsplash.com/photo-1591608511723-5e2b8f9d3e76"
]

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

  if (loading) return null
  if (!data) return null

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <div className="sm:col-span-2 relative  rounded-2xl overflow-hidden group">
          <img
            src={`${masjidImages[0]}?auto=format&fit=crop&w=1200`}
            className="w-full h-full group-hover:scale-105 transition duration-700"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
            <span className="text-amber-300 text-xs tracking-wider">
              {formatMonth(data.currentMonth)}
            </span>

            <h1 className="text-white text-xl sm:text-2xl font-bold leading-tight">
              {data.masjidName}
            </h1>

            <span className="text-xs text-emerald-200 mt-1">
              بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيْمِ
            </span>
        </div>
  
      </div>

      {/* 🌙 STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

        <StatsCard
          title="Families"
          value={data.totalFamilies}
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-emerald-100 text-emerald-700"
          subtitle="Registered"
        />

        <StatsCard
          title="Members"
          value={data.totalMembers}
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-emerald-50 text-emerald-800"
          subtitle="Community"
        />

        <StatsCard
          title="Collected"
          value={formatCurrency(data.totalCollectedMonth)}
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-amber-100 text-amber-700"
          subtitle="This month"
        />

        <StatsCard
          title="Pending"
          value={formatCurrency(data.totalPendingMonth)}
          icon={<AlertCircle className="h-5 w-5" />}
          iconBg="bg-red-100 text-red-700"
          subtitle="Due"
        />

        <StatsCard
          title="Donations"
          value={formatCurrency(data.totalDonations)}
          icon={<Gift className="h-5 w-5" />}
          iconBg="bg-amber-50 text-amber-800"
          subtitle="Sadaqah / Zakat"
        />
      </div>

      {/* 💳 TRANSACTIONS */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-emerald-800">
            Recent Transactions
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[600px]">

              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.recentTransactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell className="break-words max-w-[180px]">
                      {tx.description}
                    </TableCell>

                    <TableCell className="truncate max-w-[140px]">
                      {tx.familyName || "—"}
                    </TableCell>

                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${
                        tx.type === "donation"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border-emerald-200"
                      }`}>
                        {tx.type}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-semibold text-emerald-700 whitespace-nowrap">
                      {formatCurrency(tx.amount)}
                    </TableCell>

                    <TableCell className="text-right text-xs hidden sm:table-cell whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}