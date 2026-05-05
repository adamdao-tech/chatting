'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { User, Bot } from 'lucide-react'

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

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-purple-600' : 'bg-gray-700'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {message.files.map((file) => (
              <div key={file.id} className="text-xs text-gray-400 bg-gray-800 rounded px-2 py-1">
                {file.fileType.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.fileUrl} alt={file.fileName} className="max-w-xs max-h-40 rounded mb-1" />
                ) : null}
                <span>{file.fileName}</span>
              </div>
            ))}
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-purple-600 text-white rounded-tr-sm'
              : 'bg-gray-800 text-gray-100 rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
