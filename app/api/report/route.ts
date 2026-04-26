import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || ''
    const year = searchParams.get('year') || ''

    // Build month filter
    let monthFilter: string | undefined
    if (month && year) monthFilter = `${year}-${month.padStart(2, '0')}`
    else if (year) {
      // Get all months for the year
    }

    const contributionWhere: any = monthFilter ? { month: monthFilter } : {}
    if (year && !month) {
      contributionWhere.month = { startsWith: year }
    }

    const [contributions, donations, families] = await Promise.all([
      prisma.monthlyContribution.findMany({
        where: contributionWhere,
        include: { family: { include: { _count: { select: { members: true } } } } },
        orderBy: [{ month: 'desc' }, { family: { familyName: 'asc' } }],
      }),
      prisma.donation.findMany({
        where: monthFilter
          ? {
              createdAt: {
                gte: new Date(`${monthFilter}-01`),
                lt: new Date(new Date(`${monthFilter}-01`).setMonth(new Date(`${monthFilter}-01`).getMonth() + 1)),
              },
            }
          : year
          ? { createdAt: { gte: new Date(`${year}-01-01`), lt: new Date(`${parseInt(year) + 1}-01-01`) } }
          : {},
        include: { family: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.family.count(),
    ])

    const totalDue = contributions.reduce((s, c) => s + c.amount, 0)
    const totalCollected = contributions.reduce((s, c) => s + c.paidAmount, 0)
    const totalPending = totalDue - totalCollected
    const totalDonations = donations.reduce((s, d) => s + d.amount, 0)

    const paidCount = contributions.filter(c => c.status === 'paid').length
    const unpaidCount = contributions.filter(c => c.status === 'unpaid').length
    const partialCount = contributions.filter(c => c.status === 'partial').length

    return NextResponse.json({
      data: {
        contributions,
        donations,
        summary: {
          totalDue,
          totalCollected,
          totalPending,
          totalDonations,
          grandTotal: totalCollected + totalDonations,
          paidCount,
          unpaidCount,
          partialCount,
          totalFamilies: families,
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
