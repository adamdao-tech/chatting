import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const channels = await prisma.channel.findMany({
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(channels)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { name, description } = await req.json()
  if (!name) {
    return NextResponse.json({ error: 'Název kanálu je povinný' }, { status: 400 })
  }
  const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-áčďéěíňóřšťúůýž]/g, '')
  try {
    const channel = await prisma.channel.create({
      data: { name: cleanName, description },
    })
    return NextResponse.json(channel, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Kanál s tímto názvem již existuje' }, { status: 409 })
  }
}
