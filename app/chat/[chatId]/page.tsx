'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Menu } from 'lucide-react'
import { ChatSidebar } from '@/components/ChatSidebar'
import { ChatMessage } from '@/components/ChatMessage'
import { ChatInput } from '@/components/ChatInput'
import { TypingIndicator } from '@/components/TypingIndicator'
import toast from 'react-hot-toast'

interface FileData {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
}

interface Message {
  id: string
  role: string
  content: string
  files?: FileData[]
}

export default function ChatDetailPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch {
      toast.error('Chyba při načítání zpráv')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (content: string, fileIds: string[]) => {
    if (streaming) return

    const tempUserMsg: Message = {
      id: 'temp-user-' + Date.now(),
      role: 'user',
      content,
      files: [],
    }
    setMessages((prev) => [...prev, tempUserMsg])
    setStreaming(true)
    setStreamingContent('')

    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, fileIds }),
      })

      if (!res.ok) {
        toast.error('Chyba při odesílání zprávy')
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          fullContent += chunk
          setStreamingContent(fullContent)
        }
      }

      await fetchMessages()
      setStreamingContent('')
    } catch {
      toast.error('Nastala chyba')
    } finally {
      setStreaming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-950">
        <ChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Načítání...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <ChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-white font-medium truncate">Chat</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
          {messages.length === 0 && !streaming && (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg">Začněte konverzaci</p>
              <p className="text-sm mt-1">Napište zprávu níže</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {streaming && streamingContent && (
            <ChatMessage message={{ id: 'streaming', role: 'assistant', content: streamingContent }} />
          )}
          {streaming && !streamingContent && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <ChatInput chatId={chatId} onSend={handleSend} disabled={streaming} />
        </div>
      </div>
    </div>
  )
}
