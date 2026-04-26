"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface Family { id: string; familyName: string }

interface AddDonationModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  families: Family[]
  preselectedFamilyId?: string
}

export function AddDonationModal({ open, onClose, onSuccess, families, preselectedFamilyId }: AddDonationModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    donorName: "", familyId: preselectedFamilyId || "none",
    amount: "", type: "sadaqah", note: "", isAnonymous: false,
  })

  useEffect(() => {
    if (open) setForm(f => ({ ...f, familyId: preselectedFamilyId || "none" }))
  }, [open, preselectedFamilyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: form.isAnonymous ? null : (form.donorName || null),
          familyId: form.familyId !== "none" ? form.familyId : null,
          amount: parseFloat(form.amount),
          type: form.type,
          note: form.note || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to add donation")
      toast({ title: "Donation recorded", description: `${form.type} — ₹${form.amount}` })
      setForm({ donorName: "", familyId: "none", amount: "", type: "sadaqah", note: "", isAnonymous: false })
      onSuccess()
      onClose()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Donation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="anon" checked={form.isAnonymous}
              onChange={e => setForm(f => ({ ...f, isAnonymous: e.target.checked }))}
              className="rounded border-gray-300" />
            <Label htmlFor="anon" className="cursor-pointer">Anonymous donation</Label>
          </div>

          {!form.isAnonymous && (
            <div className="space-y-1.5">
              <Label htmlFor="donorName">Donor Name</Label>
              <Input id="donorName" placeholder="e.g. Muhammad Ahmad" value={form.donorName}
                onChange={e => setForm(f => ({ ...f, donorName: e.target.value }))} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Linked Family (optional)</Label>
            <Select value={form.familyId} onValueChange={v => setForm(f => ({ ...f, familyId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select family..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No family link</SelectItem>
                {families.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.familyName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input id="amount" type="number" min="1" step="0.01" placeholder="0.00" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sadaqah">Sadaqah</SelectItem>
                  <SelectItem value="zakat">Zakat</SelectItem>
                  <SelectItem value="fitrah">Fitrah</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note</Label>
            <Input id="note" placeholder="Purpose or remarks..." value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Saving..." : "Record Donation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
