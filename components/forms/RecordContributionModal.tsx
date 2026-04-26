"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { getMonthOptions, formatCurrency } from "@/lib/utils"

interface RecordContributionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  familyId: string
  familyName: string
  memberCount: number
  amountPerMember: number
  existingContribution?: { month: string; amount: number; paidAmount: number; status: string }
}

export function RecordContributionModal({
  open, onClose, onSuccess, familyId, familyName, memberCount, amountPerMember, existingContribution
}: RecordContributionModalProps) {
  const [loading, setLoading] = useState(false)
  const monthOptions = getMonthOptions(12)
  const totalDue = memberCount * amountPerMember

  const [form, setForm] = useState({
    month: existingContribution?.month || monthOptions[0]?.value || "",
    paidAmount: existingContribution?.paidAmount?.toString() || totalDue.toString(),
    note: "",
  })

  useEffect(() => {
    if (open) {
      setForm({
        month: existingContribution?.month || monthOptions[0]?.value || "",
        paidAmount: existingContribution?.paidAmount !== undefined ? existingContribution.paidAmount.toString() : totalDue.toString(),
        note: "",
      })
    }
  }, [open])

  const paidNum = parseFloat(form.paidAmount) || 0
  const status = paidNum >= totalDue ? "paid" : paidNum > 0 ? "partial" : "unpaid"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/contribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          amount: totalDue,
          paidAmount: paidNum,
          month: form.month,
          status,
          note: form.note || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to record")
      toast({ title: "Contribution recorded", description: `${familyName} - ${form.month}` })
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
          <DialogTitle>Record Contribution — {familyName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Members:</span>
              <span className="font-medium">{memberCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate per member:</span>
              <span className="font-medium">{formatCurrency(amountPerMember)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span className="font-medium">Total Due:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(totalDue)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Month *</Label>
            <Select value={form.month} onValueChange={v => setForm(f => ({ ...f, month: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {monthOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paidAmount">Amount Paid *</Label>
            <Input id="paidAmount" type="number" min="0" step="0.01" value={form.paidAmount}
              onChange={e => setForm(f => ({ ...f, paidAmount: e.target.value }))} />
            <p className="text-xs text-muted-foreground">
              Status will be: <span className={
                status === "paid" ? "text-emerald-600 font-medium" :
                status === "partial" ? "text-amber-600 font-medium" : "text-red-600 font-medium"
              }>{status}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" placeholder="Any remarks..." value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Saving..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
