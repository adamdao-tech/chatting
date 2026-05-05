'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Hash, Menu, X, Plus, Trash2, Send, Paperclip, LogOut, Users } from 'lucide-react'

interface Channel {
  id: string
  name: string
  description: string | null
}

interface FileData {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}

interface Message {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
    avatarColor: string
  }
  files: FileData[]
}

interface ChatUser {
  id: string
  username: string
  avatarColor: string
  online: boolean
}

function Avatar({ username, color, size = 'md' }: { username: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-10 h-10 text-sm' }
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  )
}

function FilePreview({ file }: { file: FileData }) {
  const isImage = file.fileType.startsWith('image/')
  if (isImage) {
    return (
      <img
        src={file.fileUrl}
        alt={file.fileName}
        className="max-w-xs max-h-64 rounded-lg cursor-pointer object-cover"
        onClick={() => window.open(file.fileUrl, '_blank')}
      />
    )
  }
  return (
    <a
      href={file.fileUrl}
      download={file.fileName}
      className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm hover:bg-white/20 transition-colors"
    >
      <Paperclip className="w-4 h-4 text-gray-400" />
      <span className="text-gray-300">{file.fileName}</span>
      <span className="text-gray-500 text-xs">({(file.fileSize / 1024).toFixed(0)} KB)</span>
    </a>
  )
}

function renderContent(content: string) {
  if (!content) return null
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = content.split(urlRegex)
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [input, setInput] = useState('')
  const [pendingFiles, setPendingFiles] = useState<FileData[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [membersPanelOpen, setMembersPanelOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeChannel = channels.find((c) => c.id === activeChannelId)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch('/api/channels')
      if (res.ok) {
        const data = await res.json()
        setChannels(data)
        setActiveChannelId((prev) => {
          if (!prev && data.length > 0) return data[0].id
          return prev
        })
      }
    } catch {}
  }, [])

  const fetchMessages = useCallback(async () => {
    if (!activeChannelId) return
    try {
      const res = await fetch(`/api/channels/${activeChannelId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch {}
  }, [activeChannelId])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch {}
  }, [])

  const sendHeartbeat = useCallback(async () => {
    try {
      await fetch('/api/users/heartbeat', { method: 'POST' })
    } catch {}
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetchChannels()
    fetchUsers()
    sendHeartbeat()
    heartbeatRef.current = setInterval(sendHeartbeat, 30000)
    const usersInterval = setInterval(fetchUsers, 10000)
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      clearInterval(usersInterval)
    }
  }, [status, fetchChannels, fetchUsers, sendHeartbeat])

  useEffect(() => {
    if (!activeChannelId) return
    fetchMessages()
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(fetchMessages, 2500)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [activeChannelId, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!activeChannelId) return
    if (!input.trim() && pendingFiles.length === 0) return
    setSending(true)
    try {
      const res = await fetch(`/api/channels/${activeChannelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: input.trim(),
          fileIds: pendingFiles.map((f) => f.id),
        }),
      })
      if (res.ok) {
        setInput('')
        setPendingFiles([])
        await fetchMessages()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Chyba při odesílání')
      }
    } catch {
      toast.error('Chyba při odesílání zprávy')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (pendingFiles.length + fileArray.length > 3) {
      toast.error('Maximálně 3 soubory na zprávu')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      fileArray.forEach((f) => formData.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setPendingFiles((prev) => [...prev, ...data.files])
      } else {
        const data = await res.json()
        toast.error(data.error || 'Chyba při nahrávání')
      }
    } catch {
      toast.error('Chyba při nahrávání souboru')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files)
    }
  }

  const createChannel = async () => {
    if (!newChannelName.trim()) return
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newChannelName }),
      })
      if (res.ok) {
        toast.success('Kanál vytvořen')
        setNewChannelName('')
        setShowAddChannel(false)
        await fetchChannels()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Chyba')
      }
    } catch {
      toast.error('Chyba při vytváření kanálu')
    }
  }

  const deleteChannel = async (channelId: string) => {
    if (!confirm('Smazat tento kanál a všechny zprávy?')) return
    try {
      const res = await fetch(`/api/channels/${channelId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Kanál smazán')
        if (activeChannelId === channelId) setActiveChannelId(null)
        await fetchChannels()
      }
    } catch {
      toast.error('Chyba při mazání kanálu')
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Smazat tuto zprávu?')) return
    try {
      const res = await fetch(`/api/messages/${messageId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchMessages()
      }
    } catch {
      toast.error('Chyba při mazání zprávy')
    }
  }

  const onlineUsers = users.filter((u) => u.online)
  const offlineUsers = users.filter((u) => !u.online)

  const groupedMessages = messages.reduce<Array<Message & { isGrouped: boolean }>>((acc, msg, i) => {
    const prev = messages[i - 1]
    const isGrouped =
      !!prev &&
      prev.user.id === msg.user.id &&
      new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000
    acc.push({ ...msg, isGrouped })
    return acc
  }, [])

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1a1a2e] text-white">
        <div className="text-gray-400">Načítám...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="h-screen flex bg-[#1a1a2e] text-white overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Left Sidebar - Channels */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-60 bg-[#2b2d31] flex flex-col h-screen transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* App header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-black/30 shadow-sm">
          <span className="font-bold text-white">💬 Skupinový Chat</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels list */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-2 mb-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Kanály</span>
              {session?.user?.isAdmin && (
                <button onClick={() => setShowAddChannel(!showAddChannel)} className="text-gray-400 hover:text-white">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            {showAddChannel && (
              <div className="mt-1 flex gap-1">
                <input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createChannel()}
                  placeholder="název-kanálu"
                  className="flex-1 bg-black/30 text-white text-sm rounded px-2 py-1 focus:outline-none placeholder-gray-600"
                  autoFocus
                />
                <button onClick={createChannel} className="text-indigo-400 hover:text-indigo-300">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`group flex items-center gap-1.5 px-2 py-1.5 mx-2 rounded cursor-pointer transition-colors ${
                activeChannelId === channel.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
              onClick={() => {
                setActiveChannelId(channel.id)
                setSidebarOpen(false)
              }}
            >
              <Hash className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-sm truncate">{channel.name}</span>
              {session?.user?.isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChannel(channel.id)
                  }}
                  className="hidden group-hover:block text-gray-500 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* User info at bottom */}
        <div className="h-14 bg-[#232428] px-2 flex items-center gap-2">
          {session?.user && (
            <>
              <Avatar username={session.user.username || session.user.email || 'U'} color="#6366f1" size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{session.user.username}</div>
                <div className="text-xs text-gray-400 truncate">{session.user.email}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-400 hover:text-white p-1"
                title="Odhlásit se"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <main
        className="flex-1 flex flex-col min-w-0"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Channel header */}
        <div className="h-12 border-b border-black/30 px-4 flex items-center gap-3 bg-[#313338] shadow-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          {activeChannel ? (
            <>
              <Hash className="w-5 h-5 text-gray-400" />
              <span className="font-semibold">{activeChannel.name}</span>
              {activeChannel.description && (
                <span className="text-gray-400 text-sm border-l border-gray-600 pl-3 hidden sm:block">
                  {activeChannel.description}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400">Vyberte kanál</span>
          )}
          <div className="ml-auto">
            <button
              onClick={() => setMembersPanelOpen(!membersPanelOpen)}
              className="text-gray-400 hover:text-white"
              title="Členové"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {activeChannel && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <Hash className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-gray-300 mb-1">Vítejte v #{activeChannel.name}!</h3>
              <p className="text-sm">{activeChannel.description || 'Začněte konverzaci...'}</p>
            </div>
          )}
          <div className="space-y-0.5">
            {groupedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`group flex items-start gap-3 rounded px-2 py-0.5 hover:bg-white/5 ${
                  msg.isGrouped ? 'mt-0' : 'mt-4'
                }`}
              >
                {msg.isGrouped ? (
                  <div className="w-9 flex-shrink-0" />
                ) : (
                  <Avatar username={msg.user.username} color={msg.user.avatarColor} />
                )}
                <div className="flex-1 min-w-0">
                  {!msg.isGrouped && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-semibold text-sm" style={{ color: msg.user.avatarColor }}>
                        {msg.user.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString('cs-CZ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                  {msg.content && (
                    <p className="text-gray-200 text-sm leading-relaxed break-words whitespace-pre-wrap">
                      {renderContent(msg.content)}
                    </p>
                  )}
                  {msg.files.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {msg.files.map((f) => (
                        <FilePreview key={f.id} file={f} />
                      ))}
                    </div>
                  )}
                </div>
                {(msg.user.id === session?.user?.id || session?.user?.isAdmin) && (
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="hidden group-hover:block text-gray-600 hover:text-red-400 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2 flex-shrink-0">
          {pendingFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 p-2 bg-white/5 rounded-lg">
              {pendingFiles.map((f) => (
                <div key={f.id} className="relative">
                  {f.fileType.startsWith('image/') ? (
                    <img src={f.fileUrl} alt={f.fileName} className="h-16 w-16 object-cover rounded" />
                  ) : (
                    <div className="h-16 w-24 flex items-center justify-center bg-white/10 rounded text-xs text-gray-400 px-1 text-center">
                      {f.fileName}
                    </div>
                  )}
                  <button
                    onClick={() => setPendingFiles((prev) => prev.filter((pf) => pf.id !== f.id))}
                    className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 bg-[#383a40] rounded-xl px-3 py-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !activeChannelId}
              className="text-gray-400 hover:text-white disabled:opacity-50 flex-shrink-0 pb-0.5"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.docx,.zip"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeChannel ? `Napsat zprávu do #${activeChannel.name}...` : 'Vyberte kanál...'}
              disabled={!activeChannelId || sending}
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm resize-none focus:outline-none max-h-36 overflow-y-auto"
              style={{ lineHeight: '1.5' }}
            />
            <button
              onClick={handleSend}
              disabled={sending || (!input.trim() && pendingFiles.length === 0) || !activeChannelId}
              className="text-indigo-400 hover:text-indigo-300 disabled:opacity-40 flex-shrink-0 pb-0.5"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Right sidebar - Members */}
      <aside
        className={`${membersPanelOpen ? 'flex' : 'hidden'} lg:flex flex-col w-60 bg-[#2b2d31] border-l border-black/30 h-screen flex-shrink-0`}
      >
        <div className="h-12 px-4 flex items-center border-b border-black/30 flex-shrink-0">
          <span className="font-semibold text-sm">Členové</span>
        </div>
        <div className="flex-1 overflow-y-auto py-3 px-2">
          {onlineUsers.length > 0 && (
            <>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-1">
                Online — {onlineUsers.length}
              </div>
              {onlineUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-white/5">
                  <div className="relative flex-shrink-0">
                    <Avatar username={u.username} color={u.avatarColor} size="sm" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2b2d31]" />
                  </div>
                  <span className="text-sm text-gray-200 truncate">{u.username}</span>
                </div>
              ))}
            </>
          )}
          {offlineUsers.length > 0 && (
            <div className={onlineUsers.length > 0 ? 'mt-4' : ''}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-1">
                Offline — {offlineUsers.length}
              </div>
              {offlineUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-white/5 opacity-50">
                  <div className="relative flex-shrink-0">
                    <Avatar username={u.username} color={u.avatarColor} size="sm" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-500 rounded-full border-2 border-[#2b2d31]" />
                  </div>
                  <span className="text-sm text-gray-400 truncate">{u.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
