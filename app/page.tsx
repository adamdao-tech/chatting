import Link from 'next/link'
import { MessageSquare, Users, Hash, Lock, Upload, Bell } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-indigo-400" />
            <span className="text-xl font-bold">Skupinový Chat</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors px-4 py-2">
              Přihlásit se
            </Link>
            <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
              Registrovat
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-900/30 text-indigo-300 text-sm px-3 py-1 rounded-full mb-6 border border-indigo-800">
          <Lock className="w-4 h-4" />
          Soukromý chat pro vaši skupinu
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Skupinový Chat
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Soukromý chat pro vaši partu. Komunikujte v reálném čase, sdílejte obrázky a soubory – podobně jako Discord.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105">
            Začít zdarma
          </Link>
          <Link href="/login" className="border border-gray-700 hover:border-gray-500 text-white px-8 py-4 rounded-xl text-lg transition-all hover:bg-gray-900">
            Přihlásit se
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Co nabízíme</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
              title: 'Skupinový chat',
              desc: 'Všichni vidí stejné zprávy v reálném čase. Žádné soukromé AI – jen vaše parta.',
            },
            {
              icon: <Hash className="w-6 h-6 text-purple-400" />,
              title: 'Kanály',
              desc: 'Organizujte konverzace do kanálů jako #obecný, #random nebo #oznámení.',
            },
            {
              icon: <Upload className="w-6 h-6 text-green-400" />,
              title: 'Sdílení souborů',
              desc: 'Nahrajte screenshoty, obrázky nebo dokumenty. Zobrazte je přímo v chatu.',
            },
            {
              icon: <Users className="w-6 h-6 text-yellow-400" />,
              title: 'Online status',
              desc: 'Vidíte kdo je online a kdo offline. Zelená tečka = právě aktivní.',
            },
            {
              icon: <Lock className="w-6 h-6 text-pink-400" />,
              title: 'Soukromé',
              desc: 'Registrace nutná. Jen váš tým se dostane dovnitř. Heslo + email.',
            },
            {
              icon: <Bell className="w-6 h-6 text-orange-400" />,
              title: 'Bez poplatků',
              desc: 'Žádné OpenAI API, žádné cloudové poplatky. Funguje na vlastním serveru.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
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
        <p className="text-gray-400 mb-8 text-lg">Vytvořte si účet a přidejte se ke své skupině.</p>
        <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 inline-block">
          Registrovat zdarma
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 Skupinový Chat. Všechna práva vyhrazena.</p>
      </footer>
    </div>
  )
}
