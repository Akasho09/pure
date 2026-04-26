"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface AddMemberModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  familyId: string
  familyName: string
}

export function AddMemberModal({ open, onClose, onSuccess, familyId, familyName }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", age: "", role: "member" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (!form.name.trim() || form.name.length < 2) {
      setErrors({ name: "Name must be at least 2 characters" })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          name: form.name.trim(),
          age: form.age ? parseInt(form.age) : null,
          role: form.role,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to add member")
      toast({ title: "Member added", description: `${form.name} added to ${familyName}` })
      setForm({ name: "", age: "", role: "member" })
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
          <DialogTitle>Add Member to {familyName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" placeholder="e.g. Muhammad Ali" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" min="0" max="120" placeholder="e.g. 25" value={form.age}
              onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="head">Head of Family</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
