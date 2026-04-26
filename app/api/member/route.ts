import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/lib/session'
import { MemberSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    const body = await request.json()
    const data = MemberSchema.parse(body)
    const member = await prisma.member.create({ data })
    return NextResponse.json({ data: member }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
