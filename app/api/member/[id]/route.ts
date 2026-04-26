import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/lib/session'
import { z } from 'zod'

const UpdateMemberSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  age: z.number().int().min(0).max(120).optional().nullable(),
  role: z.enum(['head', 'member']).optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    const body = await request.json()
    const data = UpdateMemberSchema.parse(body)
    const member = await prisma.member.update({ where: { id: params.id }, data })
    return NextResponse.json({ data: member })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    await prisma.member.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Member deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
