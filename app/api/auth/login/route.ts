import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { LoginSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = LoginSchema.parse(body)

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const session = await getSession()
    session.isLoggedIn = true
    session.adminId = admin.id
    session.adminEmail = admin.email
    session.adminName = admin.name
    await session.save()

    return NextResponse.json({ message: 'Login successful', admin: { id: admin.id, email: admin.email, name: admin.name } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 400 })
  }
}
