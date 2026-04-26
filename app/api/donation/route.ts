import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/lib/session'
import { DonationSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (type) where.type = type

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: { family: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.donation.count({ where }),
    ])

    return NextResponse.json({ data: donations, total, page, limit })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    const body = await request.json()
    const data = DonationSchema.parse(body)

    const donation = await prisma.donation.create({ data })

    // Log transaction
    await prisma.transaction.create({
      data: {
        type: 'donation',
        referenceId: donation.id,
        familyId: data.familyId || null,
        familyName: data.donorName || 'Anonymous',
        description: `${data.type} donation${data.note ? ': ' + data.note : ''}`,
        amount: data.amount,
      },
    })

    return NextResponse.json({ data: donation }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
