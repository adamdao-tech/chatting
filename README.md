# 💬 Skupinový Chat

Soukromý skupinový chat pro vaši partu – podobný Discordu.

## Funkce
- 💬 Skupinový chat v reálném čase
- 📁 Nahrávání obrázků a souborů
- 🔗 Klikatelné URL odkazy
- 👥 Online status členů
- 📢 Více kanálů
- 🔐 Přihlašování přes email a heslo

## Spuštění lokálně

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

## Na serveru

```bash
npm run build
npm start
```
