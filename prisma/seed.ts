import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const channels = [
    { name: 'obecný', description: 'Obecná konverzace' },
    { name: 'random', description: 'Náhodné téma' },
    { name: 'oznámení', description: 'Důležité zprávy' },
  ]

  for (const channel of channels) {
    await prisma.channel.upsert({
      where: { name: channel.name },
      update: {},
      create: channel,
    })
  }

  console.log('Seed dokončen - vytvořeny výchozí kanály')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
