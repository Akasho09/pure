"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { FamilySchema } from "@/lib/validations"
import { z } from "zod"

interface AddFamilyModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: { id: string; familyName: string; address?: string | null; phone?: string | null }
}

export function AddFamilyModal({ open, onClose, onSuccess, editData }: AddFamilyModalProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    familyName: editData?.familyName || "",
    address: editData?.address || "",
    phone: editData?.phone || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    try {
      const data = FamilySchema.parse({ ...form, address: form.address || null, phone: form.phone || null })
      setLoading(true)
      const res = await fetch(editData ? `/api/family/${editData.id}` : "/api/family", {
        method: editData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to save")
      toast({ title: editData ? "Family updated" : "Family added", variant: "default" })
      onSuccess()
      onClose()
    } catch (err: any) {
      if (err.errors) {
        const fieldErrors: Record<string, string> = {}
        err.errors.forEach((e: any) => { fieldErrors[e.path[0]] = e.message })
        setErrors(fieldErrors)
      } else {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      }
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Family" : "Add New Family"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="familyName">Family Name *</Label>
            <Input id="familyName" placeholder="e.g. Ahmad Family" value={form.familyName}
              onChange={e => setForm(f => ({ ...f, familyName: e.target.value }))} />
            {errors.familyName && <p className="text-xs text-destructive">{errors.familyName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="House No., Street, Area" value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="e.g. 9797001001" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Saving..." : editData ? "Update Family" : "Add Family"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
