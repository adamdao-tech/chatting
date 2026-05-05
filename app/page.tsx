import Link from 'next/link'
import { MessageSquare, Zap, Link as LinkIcon, FileText, History, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold">AI Chat</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors px-4 py-2">
              Přihlásit se
            </Link>
            <Link href="/register" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              Registrovat
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-900/30 text-purple-300 text-sm px-3 py-1 rounded-full mb-6 border border-purple-800">
          <Star className="w-4 h-4" />
          Zdarma k použití
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Chat s AI agentem
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Moderní chatovací platforma poháněná nejnovější AI. Ptejte se na cokoliv, přiložte soubory, sdílejte screenshoty.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105">
            Začít zdarma
          </Link>
          <Link href="/login" className="border border-gray-700 hover:border-gray-500 text-white px-8 py-4 rounded-xl text-lg transition-all hover:bg-gray-900">
            Přihlásit se
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Co AI agent umí</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6 text-yellow-400" />,
              title: 'Rychlé odpovědi',
              desc: 'Streaming odpovědi v reálném čase. Žádné čekání.',
            },
            {
              icon: <LinkIcon className="w-6 h-6 text-blue-400" />,
              title: 'Práce s odkazy',
              desc: 'Vložte URL a AI se pokusí pracovat s obsahem odkazu.',
            },
            {
              icon: <FileText className="w-6 h-6 text-green-400" />,
              title: 'Screenshoty a obrázky',
              desc: 'Přiložte screenshot nebo obrázek a poproste AI o analýzu.',
            },
            {
              icon: <FileText className="w-6 h-6 text-orange-400" />,
              title: 'Upload souborů',
              desc: 'PDF, DOCX, TXT – nahrajte soubor a ptejte se na jeho obsah.',
            },
            {
              icon: <History className="w-6 h-6 text-purple-400" />,
              title: 'Historie chatu',
              desc: 'Všechny konverzace uloženy. Kdykoli se k nim vraťte.',
            },
            {
              icon: <Star className="w-6 h-6 text-pink-400" />,
              title: 'Zdarma',
              desc: 'Základní použití zdarma. Žádná platební karta.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">Připraveni začít?</h2>
        <p className="text-gray-400 mb-8 text-lg">Vytvořte si účet zdarma a začněte chatovat s AI.</p>
        <Link href="/register" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 inline-block">
          Registrovat zdarma
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-4 py-8 text-center text-gray-500 text-sm">
        <p>© 2024 AI Chat. Všechna práva vyhrazena.</p>
      </footer>
    </div>
  )
}
