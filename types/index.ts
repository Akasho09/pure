export interface Family {
  id: string
  familyName: string
  address?: string | null
  phone?: string | null
  createdAt: Date
  updatedAt: Date
  members?: Member[]
  contributions?: MonthlyContribution[]
  donations?: Donation[]
  _count?: { members: number }
}

export interface Member {
  id: string
  name: string
  age?: number | null
  role: string
  familyId: string
  family?: Family
  createdAt: Date
}

export interface MonthlyContribution {
  id: string
  familyId: string
  family?: Family
  amount: number
  paidAmount: number
  month: string
  status: 'paid' | 'partial' | 'unpaid'
  note?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Donation {
  id: string
  donorName?: string | null
  familyId?: string | null
  family?: Family
  amount: number
  type: 'zakat' | 'sadaqah' | 'fitrah' | 'other'
  note?: string | null
  createdAt: Date
}

export interface Transaction {
  id: string
  type: string
  referenceId: string
  familyId?: string | null
  familyName?: string | null
  description: string
  amount: number
  createdAt: Date
}

export interface Settings {
  id: string
  amountPerMember: number
  masjidName: string
  updatedAt: Date
}

export interface DashboardStats {
  totalFamilies: number
  totalMembers: number
  totalCollectedMonth: number
  totalPendingMonth: number
  totalDonations: number
  recentTransactions: Transaction[]
  currentMonth: string
}

export interface FamilyWithStats extends Family {
  memberCount: number
  monthlyDue: number
  currentContribution?: MonthlyContribution
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}
