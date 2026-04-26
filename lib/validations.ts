import { z } from 'zod'

export const FamilySchema = z.object({
  familyName: z.string().min(2, 'Family name must be at least 2 characters').max(100),
  address: z.string().max(255).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
})

export const MemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.number().int().min(0).max(120).optional().nullable(),
  role: z.enum(['head', 'member']).default('member'),
  familyId: z.string().cuid('Invalid family ID'),
})

export const ContributionSchema = z.object({
  familyId: z.string().cuid('Invalid family ID'),
  amount: z.number().positive('Amount must be positive'),
  paidAmount: z.number().min(0).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  status: z.enum(['paid', 'partial', 'unpaid']).default('unpaid'),
  note: z.string().max(255).optional().nullable(),
})

export const DonationSchema = z.object({
  donorName: z.string().max(100).optional().nullable(),
  familyId: z.string().cuid().optional().nullable(),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['zakat', 'sadaqah', 'fitrah', 'other']).default('sadaqah'),
  note: z.string().max(500).optional().nullable(),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const SettingsSchema = z.object({
  amountPerMember: z.number().positive('Amount must be positive'),
  masjidName: z.string().min(2).max(100),
})

export type FamilyInput = z.infer<typeof FamilySchema>
export type MemberInput = z.infer<typeof MemberSchema>
export type ContributionInput = z.infer<typeof ContributionSchema>
export type DonationInput = z.infer<typeof DonationSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type SettingsInput = z.infer<typeof SettingsSchema>
