import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { channelId } = await params
  const { searchParams } = new URL(req.url)
  const before = searchParams.get('before')
  const limit = parseInt(searchParams.get('limit') || '50')

  const messages = await prisma.message.findMany({
    where: {
      channelId,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    include: {
      user: {
        select: { id: true, username: true, avatarColor: true },
      },
      files: true,
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  })
  return NextResponse.json(messages)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { channelId } = await params
  const { content, fileIds } = await req.json()

  if (!content?.trim() && (!fileIds || fileIds.length === 0)) {
    return NextResponse.json({ error: 'Zpráva nemůže být prázdná' }, { status: 400 })
  }

  const channel = await prisma.channel.findUnique({ where: { id: channelId } })
  if (!channel) {
    return NextResponse.json({ error: 'Kanál nenalezen' }, { status: 404 })
  }

  const message = await prisma.message.create({
    data: {
      content: content?.trim() || '',
      userId: session.user.id,
      channelId,
      ...(fileIds?.length ? {
        files: {
          connect: fileIds.map((id: string) => ({ id })),
        },
      } : {}),
    },
    include: {
      user: {
        select: { id: true, username: true, avatarColor: true },
      },
      files: true,
    },
  })
  return NextResponse.json(message, { status: 201 })
}
