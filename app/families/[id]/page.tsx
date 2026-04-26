"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Users, Phone, MapPin, Pencil, Trash2, CreditCard, Gift } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { StatusBadge, DonationTypeBadge } from "@/components/layout/StatusBadge"
import { AddMemberModal } from "@/components/forms/AddMemberModal"
import { RecordContributionModal } from "@/components/forms/RecordContributionModal"
import { AddDonationModal } from "@/components/forms/AddDonationModal"
import { AddFamilyModal } from "@/components/forms/AddFamilyModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils"
import { useAuth } from "@/components/layout/AuthProvider"
import Link from "next/link"

export default function FamilyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [family, setFamily] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showContribution, setShowContribution] = useState(false)
  const [showDonation, setShowDonation] = useState(false)
  const [showEditFamily, setShowEditFamily] = useState(false)

  const fetchData = useCallback(async () => {
    const [famRes, settRes] = await Promise.all([
      fetch(`/api/family/${id}`),
      fetch("/api/settings"),
    ])
    const [famJson, settJson] = await Promise.all([famRes.json(), settRes.json()])
    if (!famRes.ok) { router.push("/families"); return }
    setFamily(famJson.data)
    setSettings(settJson.data)
    setLoading(false)
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this family?`)) return
    const res = await fetch(`/api/member/${memberId}`, { method: "DELETE" })
    if (res.ok) { toast({ title: "Member removed" }); fetchData() }
    else toast({ title: "Error", variant: "destructive" })
  }

  const handleDeleteFamily = async () => {
    if (!confirm(`Delete ${family.familyName} and all their records? This cannot be undone.`)) return
    const res = await fetch(`/api/family/${id}`, { method: "DELETE" })
    if (res.ok) { toast({ title: "Family deleted" }); router.push("/families") }
    else toast({ title: "Error deleting family", variant: "destructive" })
  }

  if (loading) return (
    <div className="p-6 lg:p-8 animate-pulse space-y-4">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-32 bg-muted rounded-xl" />
    </div>
  )

  if (!family) return null

  const memberCount = family.members?.length || 0
  const amountPerMember = settings?.amountPerMember || 50
  const monthlyDue = memberCount * amountPerMember
  const totalContributed = family.contributions?.reduce((s: number, c: any) => s + c.paidAmount, 0) || 0
  const totalDonated = family.donations?.reduce((s: number, d: any) => s + d.amount, 0) || 0

  return (
    <div className="p-6 lg:p-8 space-y-6 page-enter">
      {/* Back + Header */}
      <div>
        <Link href="/families" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Families
        </Link>
        <PageHeader
          title={family.familyName}
          description={[family.address, family.phone].filter(Boolean).join(" · ")}
          action={isAdmin ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowEditFamily(true)}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowContribution(true)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <CreditCard className="h-4 w-4 mr-1" /> Payment
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDonation(true)} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                <Gift className="h-4 w-4 mr-1" /> Donation
              </Button>
            </div>
          ) : undefined}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Members", value: memberCount, sub: "in family" },
          { label: "Monthly Due", value: formatCurrency(monthlyDue), sub: `₹${amountPerMember} × ${memberCount}` },
          { label: "Total Contributed", value: formatCurrency(totalContributed), sub: "all time" },
          { label: "Total Donated", value: formatCurrency(totalDonated), sub: "sadaqah/zakat" },
        ].map(item => (
          <div key={item.label} className="bg-card border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
            <p className="text-xl font-display font-bold text-foreground mt-1">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Members */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" /> Members ({memberCount})
          </CardTitle>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => setShowAddMember(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Member
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {family.members?.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">No members yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Role</TableHead>
                  {isAdmin && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {family.members?.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.age || "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                        m.role === "head" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>{m.role === "head" ? "Head" : "Member"}</span>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <button onClick={() => handleDeleteMember(m.id, m.name)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Contribution History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" /> Contribution History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {family.contributions?.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">No contributions recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  {family.contributions?.[0]?.note !== undefined && <TableHead>Note</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {family.contributions?.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{formatMonth(c.month)}</TableCell>
                    <TableCell>{formatCurrency(c.amount)}</TableCell>
                    <TableCell className="font-semibold text-emerald-700">{formatCurrency(c.paidAmount)}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    {c.note !== undefined && <TableCell className="text-xs text-muted-foreground">{c.note || "—"}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Donation History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Gift className="h-4 w-4 text-muted-foreground" /> Donation History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {family.donations?.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">No donations recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {family.donations?.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.donorName || "Anonymous"}</TableCell>
                    <TableCell className="font-semibold text-emerald-700">{formatCurrency(d.amount)}</TableCell>
                    <TableCell><DonationTypeBadge type={d.type} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.note || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(d.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="pt-2 border-t">
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeleteFamily}>
            <Trash2 className="h-4 w-4 mr-1.5" /> Delete Family
          </Button>
        </div>
      )}

      {/* Modals */}
      <AddMemberModal open={showAddMember} onClose={() => setShowAddMember(false)} onSuccess={fetchData}
        familyId={family.id} familyName={family.familyName} />
      <RecordContributionModal open={showContribution} onClose={() => setShowContribution(false)} onSuccess={fetchData}
        familyId={family.id} familyName={family.familyName} memberCount={memberCount} amountPerMember={amountPerMember} />
      <AddDonationModal open={showDonation} onClose={() => setShowDonation(false)} onSuccess={fetchData}
        families={[{ id: family.id, familyName: family.familyName }]} preselectedFamilyId={family.id} />
      <AddFamilyModal open={showEditFamily} onClose={() => setShowEditFamily(false)} onSuccess={fetchData}
        editData={{ id: family.id, familyName: family.familyName, address: family.address, phone: family.phone }} />
    </div>
  )
}
