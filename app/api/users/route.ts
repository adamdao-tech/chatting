import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ONLINE_THRESHOLD_MS = 60 * 1000

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const oneMinuteAgo = new Date(Date.now() - ONLINE_THRESHOLD_MS)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      avatarColor: true,
      lastSeen: true,
    },
    orderBy: { username: 'asc' },
  })
  const usersWithStatus = users.map((u) => ({
    ...u,
    online: u.lastSeen ? u.lastSeen > oneMinuteAgo : false,
  }))
  return NextResponse.json(usersWithStatus)
}
