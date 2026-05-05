import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { messageId } = await params
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { files: true },
  })
  if (!message) {
    return NextResponse.json({ error: 'Zpráva nenalezena' }, { status: 404 })
  }
  if (message.userId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  for (const file of message.files) {
    try {
      const filePath = path.join(process.cwd(), 'public', file.fileUrl)
      await unlink(filePath)
    } catch {
      // File might not exist, ignore
    }
  }
  await prisma.message.delete({ where: { id: messageId } })
  return NextResponse.json({ success: true })
}
