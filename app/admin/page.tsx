"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Settings, Users, CreditCard, Gift, Plus, Shield,
  RefreshCw, Zap, AlertTriangle
} from "lucide-react"

import { PageHeader } from "@/components/layout/PageHeader"
import { AddFamilyModal } from "@/components/forms/AddFamilyModal"
import { AddMemberModal } from "@/components/forms/AddMemberModal"
import { RecordContributionModal } from "@/components/forms/RecordContributionModal"
import { AddDonationModal } from "@/components/forms/AddDonationModal"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table"

import { toast } from "@/components/ui/use-toast"
import {
  formatCurrency, formatDate,
  getCurrentMonth, getMonthOptions
} from "@/lib/utils"

import { useAuth } from "@/components/layout/AuthProvider"

export default function AdminPage() {
  const { isAdmin, loading, admin } = useAuth()
  const router = useRouter()

  const [families, setFamilies] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const [settingsForm, setSettingsForm] = useState({
    amountPerMember: 50,
    masjidName: ""
  })

  const [savingSettings, setSavingSettings] = useState(false)
  const [generatingMonth, setGeneratingMonth] = useState(getCurrentMonth())
  const [generating, setGenerating] = useState(false)

  const [selectedFamilyId, setSelectedFamilyId] = useState("")
  const [modals, setModals] = useState({
    addFamily: false,
    addMember: false,
    contribution: false,
    donation: false
  })

  const monthOptions = getMonthOptions(12)

  useEffect(() => {
    if (!loading && !isAdmin) router.push("/login")
  }, [isAdmin, loading, router])

  // ✅ SAFE FETCH
  const fetchData = useCallback(async () => {
    if (!isAdmin) return

    try {
      const [fRes, sRes, tRes] = await Promise.all([
        fetch("/api/family?limit=100"),
        fetch("/api/settings"),
        fetch("/api/transaction?limit=15"),
      ])

      if (!fRes.ok || !sRes.ok || !tRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const [fJson, sJson, tJson] = await Promise.all([
        fRes.json(),
        sRes.json(),
        tRes.json(),
      ])

      setFamilies(fJson?.data || [])
      setSettings(sJson?.data || {})

      setSettingsForm({
        amountPerMember: sJson?.data?.amountPerMember ?? 50,
        masjidName: sJson?.data?.masjidName ?? "",
      })

      setRecentActivity(tJson?.data || [])

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      })
    }
  }, [isAdmin])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const selectedFamily = useMemo(
    () => families.find(f => f.id === selectedFamilyId),
    [families, selectedFamilyId]
  )

  // ✅ SETTINGS SAVE
  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm)
      })

      if (!res.ok) throw new Error("Failed to save settings")

      toast({
        title: "Settings saved",
        description: `Rate: ${formatCurrency(settingsForm.amountPerMember)}/member`
      })

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSavingSettings(false)
    }
  }

  // ✅ GENERATE
  const generateContributions = async () => {
    if (!confirm(`Generate for ${generatingMonth}?`)) return

    setGenerating(true)
    try {
      const res = await fetch("/api/contribution/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: generatingMonth })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      toast({ title: "Generated", description: json.message })
      fetchData()

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!isAdmin) return null

  return (
    <div className="p-6 lg:p-8 space-y-6">

      <PageHeader
        title="Admin Panel"
        description={`Logged in as ${admin?.name} · ${admin?.email}`}
        action={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="text-xs">Admin</span>
          </div>
        }
      />

      {/* ✅ GLOBAL FAMILY SELECTOR */}
      <div className="p-4 rounded-xl border bg-blue-50 space-y-3">
        <div>
          <p className="text-xs text-blue-600">Active Family</p>
          <h3 className="font-semibold text-lg">
            {selectedFamily?.familyName || "Select a family"}
          </h3>
        </div>

        <Select value={selectedFamilyId} onValueChange={setSelectedFamilyId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose family..." />
          </SelectTrigger>
          <SelectContent>
            {families.map(f => (
              <SelectItem key={f.id} value={f.id}>
                {f.familyName} ({f._count?.members || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ✅ QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        <Button onClick={() => setModals(m => ({ ...m, addFamily: true }))}>
          <Users className="mr-2 h-4 w-4" /> Add Family
        </Button>

        <Button
          disabled={!selectedFamily}
          onClick={() => setModals(m => ({ ...m, addMember: true }))}
        >
          <Plus className="mr-2 h-4 w-4" />
          {selectedFamily ? `Add to ${selectedFamily.familyName}` : "Select Family"}
        </Button>

        <Button
          disabled={!selectedFamily}
          onClick={() => setModals(m => ({ ...m, contribution: true }))}
        >
          <CreditCard className="mr-2 h-4 w-4" /> Payment
        </Button>

        <Button onClick={() => setModals(m => ({ ...m, donation: true }))}>
          <Gift className="mr-2 h-4 w-4" /> Donation
        </Button>

      </div>

      {/* SETTINGS */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <Input
            placeholder="Masjid Name"
            value={settingsForm.masjidName}
            onChange={e =>
              setSettingsForm(f => ({ ...f, masjidName: e.target.value }))
            }
          />

          <Input
            type="number"
            value={settingsForm.amountPerMember}
            onChange={e =>
              setSettingsForm(f => ({
                ...f,
                amountPerMember: Number(e.target.value) || 0
              }))
            }
          />

          <Button onClick={saveSettings} disabled={savingSettings}>
            {savingSettings ? "Saving..." : "Save"}
          </Button>

        </CardContent>
      </Card>

      {/* RECENT ACTIVITY */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Desc</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>{tx.familyName}</TableCell>
                  <TableCell>{formatCurrency(tx.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODALS */}
      <AddFamilyModal
        open={modals.addFamily}
        onClose={() => setModals(m => ({ ...m, addFamily: false }))}
        onSuccess={fetchData}
      />

      <AddMemberModal
        open={modals.addMember && !!selectedFamilyId}
        onClose={() => setModals(m => ({ ...m, addMember: false }))}
        onSuccess={fetchData}
        familyId={selectedFamilyId}
        familyName={selectedFamily?.familyName || ""}
      />

      {selectedFamily && (
        <RecordContributionModal
          open={modals.contribution}
          onClose={() => setModals(m => ({ ...m, contribution: false }))}
          onSuccess={fetchData}
          familyId={selectedFamily.id}
          familyName={selectedFamily.familyName}
          memberCount={selectedFamily._count?.members || 0}
          amountPerMember={settings?.amountPerMember || 50}
        />
      )}

      <AddDonationModal
        open={modals.donation}
        onClose={() => setModals(m => ({ ...m, donation: false }))}
        onSuccess={fetchData}
        families={families}
      />

    </div>
  )
}