import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/lib/session'
import { FamilySchema } from '@/lib/validations'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const family = await prisma.family.findUnique({
      where: { id: params.id },
      include: {
        members: { orderBy: { role: 'asc' } },
        contributions: { orderBy: { month: 'desc' } },
        donations: { orderBy: { createdAt: 'desc' } },
        _count: { select: { members: true } },
      },
    })
    if (!family) return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    return NextResponse.json({ data: family })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    const body = await request.json()
    const data = FamilySchema.parse(body)
    const family = await prisma.family.update({ where: { id: params.id }, data })
    return NextResponse.json({ data: family })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    await prisma.family.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Family deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
