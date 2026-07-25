import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import 'dotenv/config'

const databaseUrl = process.env['DATABASE_URL']

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não encontrada no .env')
  process.exit(1)
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

const SEED_EMAIL = 'bernardo.soares30@outlook.com'
const SEED_PASSWORD = 'B3Rn4rDo06!'

const CATEGORIES = [
  'alimentacao',
  'transporte',
  'lazer',
  'moradia',
  'saude',
  'educacao',
  'outros',
] as const

const EXPENSES: Array<{
  title: string
  category: (typeof CATEGORIES)[number]
  amount: number
  date: Date
}> = [
  { title: 'Mercado Extra', category: 'alimentacao', amount: 420.5, date: daysAgo(2) },
  { title: 'Uber para reunião', category: 'transporte', amount: 34.9, date: daysAgo(2) },
  { title: 'Cinema com amigos', category: 'lazer', amount: 89.9, date: daysAgo(5) },
  { title: 'Aluguel', category: 'moradia', amount: 1500.0, date: daysAgo(1) },
  { title: 'Consulta médica', category: 'saude', amount: 250.0, date: daysAgo(7) },
  { title: 'Curso de inglês', category: 'educacao', amount: 199.9, date: daysAgo(10) },
  { title: 'Presente aniversário', category: 'outros', amount: 120.0, date: daysAgo(12) },
  { title: 'Padaria', category: 'alimentacao', amount: 18.5, date: daysAgo(1) },
  { title: 'Gasolina', category: 'transporte', amount: 180.0, date: daysAgo(4) },
  { title: 'Netflix', category: 'lazer', amount: 39.9, date: daysAgo(15) },
  { title: 'Conta de luz', category: 'moradia', amount: 210.0, date: daysAgo(3) },
  { title: 'Farmácia', category: 'saude', amount: 67.4, date: daysAgo(6) },
  { title: 'Livros técnicos', category: 'educacao', amount: 145.0, date: daysAgo(9) },
  { title: 'Doação', category: 'outros', amount: 50.0, date: daysAgo(11) },
]

const GOALS = [
  {
    name: 'Viagem para o Nordeste',
    targetAmount: 4000,
    currentAmount: 1200,
    deadline: daysFromNow(180),
    achieved: false,
  },
  {
    name: 'Notebook novo',
    targetAmount: 3500,
    currentAmount: 3500,
    deadline: daysFromNow(60),
    achieved: true,
  },
  {
    name: 'Reserva de emergência',
    targetAmount: 10000,
    currentAmount: 3500,
    deadline: daysFromNow(365),
    achieved: false,
  },
]

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(12, 0, 0, 0)
  return d
}

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(12, 0, 0, 0)
  return d
}

function isProductionDatabase(url: string | undefined): boolean {
  if (!url) return true
  const productionIndicators = [
    'supabase.co',
    'amazonaws.com',
    'neon.tech',
    'vercel-storage',
    'railway.app',
    'render.com',
    'clever-cloud',
    'heroku',
    'digitalocean',
    'azure',
    'cloud.google',
  ]
  return productionIndicators.some((indicator) => url.toLowerCase().includes(indicator))
}

async function main() {
  if (isProductionDatabase(databaseUrl)) {
    console.error('❌ Abortando: DATABASE_URL parece apontar para um banco de produção.')
    console.error('   Use este script apenas com banco local/dev.')
    process.exit(1)
  }

  console.log('🌱 Iniciando seed em:', databaseUrl?.replace(/:[^:]*@/, ':***@'))

  const saltRounds = Number(process.env['SALT_ROUNDS'] ?? 10)
  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, saltRounds)

  const user = await prisma.user.upsert({
    where: { email: SEED_EMAIL },
    update: {
      name: 'Bernardo Soares',
      password: hashedPassword,
      salary: 6500,
      economy: 1300,
      plan: 'PADRAO',
    },
    create: {
      email: SEED_EMAIL,
      name: 'Bernardo Soares',
      password: hashedPassword,
      salary: 6500,
      economy: 1300,
      plan: 'PADRAO',
    },
  })

  await prisma.expense.deleteMany({ where: { userId: user.id } })
  await prisma.goal.deleteMany({ where: { userId: user.id } })

  await prisma.expense.createMany({
    data: EXPENSES.map((e) => ({ ...e, userId: user.id })),
  })

  await prisma.goal.createMany({
    data: GOALS.map((g) => ({ ...g, userId: user.id })),
  })

  const expenseCount = await prisma.expense.count({ where: { userId: user.id } })
  const goalCount = await prisma.goal.count({ where: { userId: user.id } })

  console.log(`✅ Seed concluído para ${user.email}`)
  console.log(`   Usuário: ${user.name}`)
  console.log(`   Gastos: ${expenseCount}`)
  console.log(`   Metas: ${goalCount}`)
  console.log(`   Senha: ${SEED_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
