import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentMonth } from '@/lib/utils'

export async function GET() {
  try {
    const currentMonth = getCurrentMonth()

    const [
      totalFamilies,
      totalMembers,
      currentContributions,
      donations,
      recentTransactions,
      settings,
    ] = await Promise.all([
      prisma.family.count(),
      prisma.member.count(),
      prisma.monthlyContribution.findMany({ where: { month: currentMonth } }),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.settings.findFirst(),
    ])

    const totalCollectedMonth = currentContributions.reduce((sum, c) => sum + c.paidAmount, 0)
    const totalDueMonth = currentContributions.reduce((sum, c) => sum + c.amount, 0)
    const totalPendingMonth = totalDueMonth - totalCollectedMonth

    return NextResponse.json({
      data: {
        totalFamilies,
        totalMembers,
        totalCollectedMonth,
        totalPendingMonth,
        totalDonations: donations._sum.amount || 0,
        recentTransactions,
        currentMonth,
        amountPerMember: settings?.amountPerMember || 50,
        masjidName: settings?.masjidName || 'Village Masjid',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
