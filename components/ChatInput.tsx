'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, Paperclip, X, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadedFile {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
}

interface ChatInputProps {
  chatId: string
  onSend: (content: string, fileIds: string[]) => void
  disabled?: boolean
}

export function ChatInput({ chatId, onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (!text.trim() && files.length === 0) return
    onSend(text, files.map((f) => f.id))
    setText('')
    setFiles([])
  }

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Soubor je příliš velký (max 10 MB)')
      return
    }
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) {
      toast.error('Nepodporovaný typ souboru')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('chatId', chatId)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Upload selhal')
        return
      }
      const uploaded = await res.json()
      setFiles((prev) => {
        if (prev.length >= 3) {
          toast.error('Maximálně 3 soubory na zprávu')
          return prev
        }
        return [...prev, uploaded]
      })
    } catch {
      toast.error('Chyba při nahrávání souboru')
    } finally {
      setUploading(false)
    }
  }, [chatId])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    for (const f of selected) await uploadFile(f)
    e.target.value = ''
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    for (const f of dropped) await uploadFile(f)
  }, [uploadFile])

  return (
    <div
      className={`border-t border-gray-800 p-4 ${dragging ? 'bg-purple-900/20' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((f) => (
            <div key={f.id} className="relative group">
              {f.fileType.startsWith('image/') ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.fileUrl} alt={f.fileName} className="w-16 h-16 object-cover rounded-lg" />
                  <button
                    onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1 text-xs text-gray-300">
                  <FileText className="w-3 h-3" />
                  <span className="max-w-[100px] truncate">{f.fileName}</span>
                  <button onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}>
                    <X className="w-3 h-3 text-gray-400 hover:text-white" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || disabled}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
          title="Přiložit soubor"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={dragging ? 'Pusťte soubor sem...' : 'Napište zprávu... (Ctrl+Enter = odeslat)'}
          rows={1}
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none text-sm"
          style={{ maxHeight: '150px', overflowY: 'auto' }}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement
            t.style.height = 'auto'
            t.style.height = Math.min(t.scrollHeight, 150) + 'px'
          }}
        />

        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && files.length === 0)}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
