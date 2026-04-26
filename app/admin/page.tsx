"use client"
import { useEffect, useState, useCallback } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate, getCurrentMonth, getMonthOptions } from "@/lib/utils"
import { useAuth } from "@/components/layout/AuthProvider"

export default function AdminPage() {
  const { isAdmin, loading, admin } = useAuth()
  const router = useRouter()
  const [families, setFamilies] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [settingsForm, setSettingsForm] = useState({ amountPerMember: 50, masjidName: "" })
  const [savingSettings, setSavingSettings] = useState(false)
  const [generatingMonth, setGeneratingMonth] = useState(getCurrentMonth())
  const [generating, setGenerating] = useState(false)
  const [selectedFamilyId, setSelectedFamilyId] = useState("")
  const [modals, setModals] = useState({ addFamily: false, addMember: false, contribution: false, donation: false })
  const monthOptions = getMonthOptions(12)

  useEffect(() => { if (!loading && !isAdmin) router.push("/login") }, [isAdmin, loading, router])

  const fetchData = useCallback(async () => {
    if (!isAdmin) return
    const [fRes, sRes, tRes] = await Promise.all([
      fetch("/api/family?limit=100"),
      fetch("/api/settings"),
      fetch("/api/transaction?limit=15"),
    ])
    const [fJson, sJson, tJson] = await Promise.all([fRes.json(), sRes.json(), tRes.json()])
    const fetchedFamilies = fJson.data || []
    setFamilies(fetchedFamilies)
    if (fetchedFamilies.length > 0 && !selectedFamilyId) setSelectedFamilyId(fetchedFamilies[0].id)
    setSettings(sJson.data)
    setSettingsForm({ amountPerMember: sJson.data?.amountPerMember || 50, masjidName: sJson.data?.masjidName || "" })
    setRecentActivity(tJson.data || [])
  }, [isAdmin, selectedFamilyId])

  useEffect(() => { fetchData() }, [fetchData])

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settingsForm) })
      if (!res.ok) throw new Error("Failed to save settings")
      toast({ title: "Settings saved", description: `Rate: ${formatCurrency(settingsForm.amountPerMember)}/member` })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setSavingSettings(false) }
  }

  const generateContributions = async () => {
    if (!confirm(`Generate contribution records for ALL families for ${generatingMonth}?`)) return
    setGenerating(true)
    try {
      const res = await fetch("/api/contribution/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month: generatingMonth }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast({ title: "Contributions generated", description: json.message })
      fetchData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setGenerating(false) }
  }

  const selectedFamily = families.find(f => f.id === selectedFamilyId)

  if (loading) return (
    <div className="p-6 lg:p-8 animate-pulse space-y-4">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>
    </div>
  )

  if (!isAdmin) return null

  return (
    <div className="p-6 lg:p-8 space-y-6 page-enter">
      <PageHeader
        title="Admin Panel"
        description={`Logged in as ${admin?.name || "Admin"} · ${admin?.email}`}
        action={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Admin Access</span>
          </div>
        }
      />

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add Family", icon: Users, color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100", action: () => setModals(m => ({ ...m, addFamily: true })) },
            { label: "Add Member", icon: Plus, color: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100", action: () => setModals(m => ({ ...m, addMember: true })) },
            { label: "Record Payment", icon: CreditCard, color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", action: () => setModals(m => ({ ...m, contribution: true })) },
            { label: "Add Donation", icon: Gift, color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100", action: () => setModals(m => ({ ...m, donation: true })) },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className={`flex flex-col items-center gap-2.5 p-5 rounded-xl border text-sm font-medium transition-all duration-150 active:scale-95 ${item.color}`}>
              <item.icon className="h-6 w-6" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" /> System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Masjid Name</Label>
              <Input value={settingsForm.masjidName} onChange={e => setSettingsForm(f => ({ ...f, masjidName: e.target.value }))} placeholder="e.g. Al-Noor Masjid" />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Amount per Member (₹)</Label>
              <Input type="number" min="1" value={settingsForm.amountPerMember}
                onChange={e => setSettingsForm(f => ({ ...f, amountPerMember: parseFloat(e.target.value) || 0 }))} />
              <p className="text-xs text-muted-foreground">
                4-member family owes <strong className="text-emerald-700">{formatCurrency((settingsForm.amountPerMember || 0) * 4)}</strong>/month
              </p>
            </div>
            <Button onClick={saveSettings} disabled={savingSettings} className="bg-emerald-600 hover:bg-emerald-700">
              {savingSettings ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Generate Contributions */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" /> Generate Monthly Records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Auto-create contribution records for all <strong>{families.length}</strong> families.
            </p>
            <div className="space-y-1.5">
              <Label>Select Month</Label>
              <Select value={generatingMonth} onValueChange={setGeneratingMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {monthOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Creates <strong>unpaid</strong> records. Mark each as paid after collection.</p>
            </div>
            <Button onClick={generateContributions} disabled={generating} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <RefreshCw className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Generating..." : `Generate for ${generatingMonth}`}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment by Family */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" /> Record Payment for Family
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <Label>Select Family</Label>
              <Select value={selectedFamilyId} onValueChange={setSelectedFamilyId}>
                <SelectTrigger><SelectValue placeholder="Choose a family..." /></SelectTrigger>
                <SelectContent>
                  {families.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.familyName} ({f._count?.members || 0} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setModals(m => ({ ...m, contribution: true }))} disabled={!selectedFamilyId} className="bg-emerald-600 hover:bg-emerald-700">
              <CreditCard className="h-4 w-4 mr-2" /> Record Payment
            </Button>
          </div>
          {selectedFamily && (
            <p className="text-xs text-muted-foreground mt-2">
              Monthly due: <strong className="text-foreground">{formatCurrency((selectedFamily._count?.members || 0) * (settings?.amountPerMember || 50))}</strong>
              {" "}({selectedFamily._count?.members || 0} members × {formatCurrency(settings?.amountPerMember || 50)})
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentActivity.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">No activity recorded yet</p>
          ) : (
            <Table>
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
                {recentActivity.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm font-medium max-w-[200px] truncate">{tx.description}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tx.familyName || "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        tx.type === "donation" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {tx.type === "donation" ? "Donation" : "Contribution"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-700">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell">{formatDate(tx.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddFamilyModal open={modals.addFamily} onClose={() => setModals(m => ({ ...m, addFamily: false }))} onSuccess={fetchData} />
      <AddMemberModal
        open={modals.addMember} onClose={() => setModals(m => ({ ...m, addMember: false }))} onSuccess={fetchData}
        familyId={selectedFamilyId || families[0]?.id || ""}
        familyName={selectedFamily?.familyName || families[0]?.familyName || ""}
      />
      {selectedFamily && (
        <RecordContributionModal
          open={modals.contribution} onClose={() => setModals(m => ({ ...m, contribution: false }))} onSuccess={fetchData}
          familyId={selectedFamily.id} familyName={selectedFamily.familyName}
          memberCount={selectedFamily._count?.members || 0} amountPerMember={settings?.amountPerMember || 50}
        />
      )}
      <AddDonationModal open={modals.donation} onClose={() => setModals(m => ({ ...m, donation: false }))} onSuccess={fetchData} families={families} />
    </div>
  )
}
