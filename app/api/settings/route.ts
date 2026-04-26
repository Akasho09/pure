import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '@/lib/session'
import { SettingsSchema } from '@/lib/validations'

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst()
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'default', amountPerMember: 50, masjidName: 'Village Masjid' },
      })
    }
    return NextResponse.json({ data: settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()

  try {
    const body = await request.json()
    const data = SettingsSchema.parse(body)
    const settings = await prisma.settings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    })
    return NextResponse.json({ data: settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
