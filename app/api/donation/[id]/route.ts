import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/lib/session'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    await prisma.donation.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Donation deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
