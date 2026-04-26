import { cn } from "@/lib/utils"
import { getContributionStatus, getDonationType } from "@/lib/utils"

export function StatusBadge({ status }: { status: string }) {
  const { label, color } = getContributionStatus(status)
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", color)}>
      {label}
    </span>
  )
}

export function DonationTypeBadge({ type }: { type: string }) {
  const { label, color } = getDonationType(type)
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", color)}>
      {label}
    </span>
  )
}
