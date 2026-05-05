import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
  'application/pdf', 'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const chatId = formData.get('chatId') as string | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!chatId) {
    return NextResponse.json({ error: 'chatId required' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const chat = await prisma.chat.findUnique({ where: { id: chatId } })
  if (!chat || chat.userId !== session.user.id) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', session.user.id)
  await mkdir(uploadsDir, { recursive: true })

  const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const filePath = path.join(uploadsDir, uniqueName)
  await writeFile(filePath, buffer)

  const fileUrl = `/uploads/${session.user.id}/${uniqueName}`

  const dbFile = await prisma.file.create({
    data: {
      userId: session.user.id,
      chatId,
      fileName: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
    },
  })

  return NextResponse.json(dbFile, { status: 201 })
}
