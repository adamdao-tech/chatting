# AI Chat – Moderní webová AI chatovací aplikace

Moderní webová aplikace pro chatování s AI agentem. Postavena na Next.js 16, Prisma + SQLite, NextAuth.js a OpenAI API.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes
- **Databáze:** SQLite (Prisma ORM v5)
- **Auth:** NextAuth.js v4 (email + heslo, bcrypt)
- **AI:** OpenAI API (GPT-4o-mini, streaming)
- **Upload:** lokální `/public/uploads/`
- **Markdown:** react-markdown + remark-gfm

## Funkce

- 🔐 Registrace a přihlášení (email + heslo)
- 💬 Chatovací rozhraní podobné ChatGPT
- 🤖 AI odpovědi v reálném čase (streaming)
- 📁 Upload souborů (PNG, JPG, WEBP, PDF, TXT, DOCX)
- 📜 Historie konverzací
- 🗑️ Přejmenování a mazání chatů
- 📱 Responzivní design (mobil, tablet, desktop)

## Spuštění lokálně

```bash
npm install
cp .env.example .env
# Vyplň .env hodnoty (viz níže)
npx prisma generate
npx prisma db push
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000).

## ENV proměnné

| Proměnná | Popis |
|---|---|
| `DATABASE_URL` | Cesta k SQLite databázi, např. `file:./dev.db` |
| `NEXTAUTH_SECRET` | Tajný klíč pro NextAuth.js (vygeneruj: `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL aplikace, např. `http://localhost:3000` |
| `OPENAI_API_KEY` | API klíč z [platform.openai.com](https://platform.openai.com) |
