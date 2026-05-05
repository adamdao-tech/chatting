import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. AI responses will fail.')
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' })

const SYSTEM_PROMPT = `Jsi užitečný AI asistent uvnitř webové chatovací aplikace. Odpovídej jasně, prakticky a přehledně. Pokud uživatel pošle odkaz, screenshot nebo soubor, pokus se s ním pracovat podle dostupných možností backendu. Pokud k obsahu nemáš přístup, řekni to narovinu a požádej uživatele, aby vložil text nebo popsal obsah.`

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const chat = await prisma.chat.findUnique({ where: { id: chatId } })
  if (!chat || chat.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
    include: { files: true },
  })
  return NextResponse.json(messages)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const chat = await prisma.chat.findUnique({ where: { id: chatId } })
  if (!chat || chat.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { content, fileIds } = await req.json()
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  const userMessage = await prisma.message.create({
    data: {
      chatId,
      role: 'user',
      content,
    },
  })

  if (fileIds?.length) {
    await prisma.file.updateMany({
      where: { id: { in: fileIds }, userId: session.user.id },
      data: { messageId: userMessage.id },
    })
  }

  const history = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })

  const messages = history.map((m) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }))

  if (history.length === 1) {
    const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
    await prisma.chat.update({
      where: { id: chatId },
      data: { title },
    })
  }

  const encoder = new TextEncoder()
  let assistantContent = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        })

        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            assistantContent += text
            controller.enqueue(encoder.encode(text))
          }
        }

        await prisma.message.create({
          data: {
            chatId,
            role: 'assistant',
            content: assistantContent,
          },
        })

        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        })
      } catch (error) {
        console.error('OpenAI error:', error)
        const errorMsg = 'Omlouvám se, nastala chyba při komunikaci s AI. Zkuste to prosím znovu.'
        controller.enqueue(encoder.encode(errorMsg))
        await prisma.message.create({
          data: {
            chatId,
            role: 'assistant',
            content: errorMsg,
          },
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
