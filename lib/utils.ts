import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-')
  const date = new Date(parseInt(year), parseInt(monthNum) - 1)
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export function getMonthOptions(count = 12): { value: string; label: string }[] {
  const options = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    options.push({ value, label: formatMonth(value) })
  }
  return options
}

export function getContributionStatus(status: string) {
  switch (status) {
    case 'paid': return { label: 'Paid', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    case 'partial': return { label: 'Partial', color: 'text-amber-700 bg-amber-50 border-amber-200' }
    case 'unpaid': return { label: 'Unpaid', color: 'text-red-700 bg-red-50 border-red-200' }
    default: return { label: status, color: 'text-gray-700 bg-gray-50 border-gray-200' }
  }
}

export function getDonationType(type: string) {
  switch (type) {
    case 'zakat': return { label: 'Zakat', color: 'text-blue-700 bg-blue-50 border-blue-200' }
    case 'sadaqah': return { label: 'Sadaqah', color: 'text-purple-700 bg-purple-50 border-purple-200' }
    case 'fitrah': return { label: 'Fitrah', color: 'text-teal-700 bg-teal-50 border-teal-200' }
    case 'other': return { label: 'Other', color: 'text-gray-700 bg-gray-50 border-gray-200' }
    default: return { label: type, color: 'text-gray-700 bg-gray-50 border-gray-200' }
  }
}

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
