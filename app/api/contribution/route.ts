import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/lib/session'
import { ContributionSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const familyId = searchParams.get('familyId')

    const where: any = {}
    if (month) where.month = month
    if (familyId) where.familyId = familyId

    const contributions = await prisma.monthlyContribution.findMany({
      where,
      include: { family: { include: { _count: { select: { members: true } } } } },
      orderBy: [{ month: 'desc' }, { family: { familyName: 'asc' } }],
    })
    return NextResponse.json({ data: contributions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    const body = await request.json()
    const data = ContributionSchema.parse(body)

    const status = data.paidAmount !== undefined
      ? data.paidAmount >= data.amount ? 'paid' : data.paidAmount > 0 ? 'partial' : 'unpaid'
      : data.status

    const contribution = await prisma.monthlyContribution.upsert({
      where: { familyId_month: { familyId: data.familyId, month: data.month } },
      update: { amount: data.amount, paidAmount: data.paidAmount ?? 0, status, note: data.note },
      create: { ...data, paidAmount: data.paidAmount ?? 0, status },
    })

    // Log transaction if paid
    if (status === 'paid' || status === 'partial') {
      const family = await prisma.family.findUnique({ where: { id: data.familyId } })
      await prisma.transaction.upsert({
        where: { id: `contrib-${contribution.id}` },
        update: { amount: data.paidAmount ?? data.amount, description: `Monthly contribution - ${data.month} (${status})` },
        create: {
          id: `contrib-${contribution.id}`,
          type: 'monthly_contribution',
          referenceId: contribution.id,
          familyId: data.familyId,
          familyName: family?.familyName,
          description: `Monthly contribution - ${data.month} (${status})`,
          amount: data.paidAmount ?? data.amount,
        },
      })
    }

    return NextResponse.json({ data: contribution }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
