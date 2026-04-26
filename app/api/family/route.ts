import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/lib/session'
import { FamilySchema } from '@/lib/validations'
import { getCurrentMonth } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const currentMonth = getCurrentMonth()

    const where = search
      ? { OR: [{ familyName: { contains: search } }, { address: { contains: search } }] }
      : {}

    const [families, total] = await Promise.all([
      prisma.family.findMany({
        where,
        include: {
          _count: { select: { members: true } },
          contributions: { where: { month: currentMonth }, take: 1 },
        },
        orderBy: { familyName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.family.count({ where }),
    ])

    const settings = await prisma.settings.findFirst()
    const amountPerMember = settings?.amountPerMember || 50

    const enriched = families.map(f => ({
      ...f,
      memberCount: f._count.members,
      monthlyDue: f._count.members * amountPerMember,
      currentContribution: f.contributions[0] || null,
    }))

    return NextResponse.json({ data: enriched, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    const body = await request.json()
    const data = FamilySchema.parse(body)

    const family = await prisma.family.create({ data })
    return NextResponse.json({ data: family }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
