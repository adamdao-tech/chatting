'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { MessageSquare } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Heslo musí mít alespoň 6 znaků')
      return
    }
    if (username.length < 2) {
      toast.error('Přezdívka musí mít alespoň 2 znaky')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registrace selhala')
        return
      }
      toast.success('Účet vytvořen! Přihlaste se.')
      router.push('/login')
    } catch {
      toast.error('Nastala chyba při registraci')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <MessageSquare className="w-8 h-8 text-indigo-400" />
            <span className="text-2xl font-bold">Skupinový Chat</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Vytvořit účet</h1>
          <p className="text-gray-400 mt-2">Přidejte se ke skupině</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
              placeholder="vas@email.cz"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Přezdívka</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
              placeholder="vase_prezdivka"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
              placeholder="Alespoň 6 znaků"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Vytvářím účet...' : 'Registrovat'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          Máte účet?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            Přihlásit se
          </Link>
        </p>
      </div>
    </div>
  )
}
