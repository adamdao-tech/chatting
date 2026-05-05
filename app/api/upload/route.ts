import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
  'application/pdf', 'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
]
const MAX_SIZE = 10 * 1024 * 1024
const MAX_FILES = 3

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'Žádný soubor nebyl nahrán' }, { status: 400 })
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Maximálně ${MAX_FILES} soubory najednou` }, { status: 400 })
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  const uploadedFiles = []

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Nepodporovaný typ souboru: ${file.type}` }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Soubor ${file.name} je příliš velký (max 10MB)` }, { status: 400 })
    }

    const ext = path.extname(file.name)
    const uniqueName = `${crypto.randomUUID()}${ext}`
    const filePath = path.join(uploadDir, uniqueName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const fileRecord = await prisma.file.create({
      data: {
        fileName: file.name,
        fileUrl: `/api/uploads/${uniqueName}`,
        fileType: file.type,
        fileSize: file.size,
        userId: session.user.id,
      },
    })
    uploadedFiles.push(fileRecord)
  }

  return NextResponse.json({ files: uploadedFiles }, { status: 201 })
}