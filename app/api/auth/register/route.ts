import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json()
    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Email, heslo a přezdívka jsou povinné' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Heslo musí mít alespoň 6 znaků' }, { status: 400 })
    }
    if (username.length < 2 || username.length > 32) {
      return NextResponse.json({ error: 'Přezdívka musí mít 2-32 znaků' }, { status: 400 })
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Přezdívka smí obsahovat jen písmena, čísla a podtržítko' }, { status: 400 })
    }
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email je již registrován' }, { status: 409 })
    }
    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) {
      return NextResponse.json({ error: 'Přezdívka je již obsazena' }, { status: 409 })
    }
    const passwordHash = await bcrypt.hash(password, 12)
    const userCount = await prisma.user.count()
    const isAdmin = userCount === 0

    const avatarColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)]

    const user = await prisma.user.create({
      data: { email, username, passwordHash, isAdmin, avatarColor },
    })
    return NextResponse.json({ id: user.id, email: user.email, username: user.username }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
