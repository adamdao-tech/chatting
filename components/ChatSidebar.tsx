'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import { MessageSquare, Plus, Trash2, Pencil, Check, X, LogOut } from 'lucide-react'

interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [chats, setChats] = useState<Chat[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats')
      if (res.ok) {
        const data = await res.json()
        setChats(data)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchChats()
  }, [pathname])

  const createChat = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      if (res.ok) {
        const chat = await res.json()
        await fetchChats()
        router.push(`/chat/${chat.id}`)
        onClose()
      }
    } catch {
      toast.error('Chyba při vytváření chatu')
    } finally {
      setLoading(false)
    }
  }

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Smazat tento chat?')) return
    try {
      const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchChats()
        if (pathname === `/chat/${id}`) router.push('/chat')
        toast.success('Chat smazán')
      }
    } catch {
      toast.error('Chyba při mazání chatu')
    }
  }

  const startEdit = (chat: Chat, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(chat.id)
    setEditTitle(chat.title)
  }

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle }),
      })
      if (res.ok) {
        await fetchChats()
        setEditingId(null)
      }
    } catch {
      toast.error('Chyba při přejmenování')
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-screen transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <span className="font-bold text-white">AI Chat</span>
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={createChat}
            disabled={loading}
            className="w-full flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nový chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">Žádné chaty</p>
          )}
          {chats.map((chat) => {
            const isActive = pathname === `/chat/${chat.id}`
            const isEditing = editingId === chat.id
            return (
              <div key={chat.id} className={`group rounded-lg mb-1 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}>
                {isEditing ? (
                  <div className="flex items-center gap-1 p-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(chat.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(chat.id)} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <Link href={`/chat/${chat.id}`} onClick={onClose} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-gray-300 truncate flex-1">{chat.title}</span>
                    <div className="hidden group-hover:flex items-center gap-1 ml-2">
                      <button onClick={(e) => startEdit(chat, e)} className="text-gray-400 hover:text-white p-0.5"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => deleteChat(chat.id, e)} className="text-gray-400 hover:text-red-400 p-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Odhlásit se
          </button>
        </div>
      </aside>
    </>
  )
}
