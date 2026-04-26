import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/lib/session'
import { getCurrentMonth } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    const body = await request.json()
    const month = body.month || getCurrentMonth()

    const [families, settings] = await Promise.all([
      prisma.family.findMany({ include: { _count: { select: { members: true } } } }),
      prisma.settings.findFirst(),
    ])

    const amountPerMember = settings?.amountPerMember || 50
    let created = 0
    let skipped = 0

    for (const family of families) {
      const amount = family._count.members * amountPerMember
      if (amount === 0) { skipped++; continue }

      await prisma.monthlyContribution.upsert({
        where: { familyId_month: { familyId: family.id, month } },
        update: { amount }, // update amount only, not paid status
        create: { familyId: family.id, amount, paidAmount: 0, month, status: 'unpaid' },
      })
      created++
    }

    return NextResponse.json({
      message: `Generated ${created} contributions for ${month}`,
      created,
      skipped,
      month,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
