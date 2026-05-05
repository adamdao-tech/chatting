'use client'

import { useState } from 'react'
import { ChatSidebar } from '@/components/ChatSidebar'
import { Menu, MessageSquare } from 'lucide-react'

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-950">
      <ChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col items-center justify-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 md:hidden text-gray-400 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
        <MessageSquare className="w-16 h-16 text-gray-700 mb-4" />
        <h1 className="text-2xl font-bold text-gray-400 mb-2">Vyberte chat nebo začněte nový</h1>
        <p className="text-gray-600 text-sm">Klikněte na „Nový chat" v levém panelu</p>
      </div>
    </div>
  )
}
