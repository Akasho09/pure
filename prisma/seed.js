// @ts-nocheck
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@masjid.com' },
    update: {},
    create: { email: 'admin@masjid.com', password: hashedPassword, name: 'Masjid Admin' },
  })
  console.log('✅ Admin created: admin@masjid.com / admin123')

  // Settings
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', amountPerMember: 50, masjidName: 'Al-Noor Masjid' },
  })
  console.log('✅ Settings created')

  // Families
  const familyData = [
    {
      familyName: 'Ahmad Family', address: 'House 12, Main Bazaar', phone: '9797001001',
      members: [
        { name: 'Muhammad Ahmad', age: 45, role: 'head' },
        { name: 'Fatima Ahmad', age: 40, role: 'member' },
        { name: 'Ali Ahmad', age: 18, role: 'member' },
        { name: 'Zainab Ahmad', age: 14, role: 'member' },
      ],
    },
    {
      familyName: 'Khan Family', address: 'House 5, Near Masjid', phone: '9797002002',
      members: [
        { name: 'Rashid Khan', age: 52, role: 'head' },
        { name: 'Amina Khan', age: 48, role: 'member' },
        { name: 'Omar Khan', age: 22, role: 'member' },
      ],
    },
    {
      familyName: 'Malik Family', address: 'House 8, Old Colony', phone: '9797003003',
      members: [
        { name: 'Tariq Malik', age: 38, role: 'head' },
        { name: 'Sana Malik', age: 35, role: 'member' },
        { name: 'Hassan Malik', age: 10, role: 'member' },
        { name: 'Hira Malik', age: 7, role: 'member' },
        { name: 'Ibrahim Malik', age: 3, role: 'member' },
      ],
    },
    {
      familyName: 'Sheikh Family', address: 'House 21, New Colony', phone: '9797004004',
      members: [
        { name: 'Bilal Sheikh', age: 60, role: 'head' },
        { name: 'Khadijah Sheikh', age: 55, role: 'member' },
      ],
    },
    {
      familyName: 'Qureshi Family', address: 'House 3, Market Road', phone: '9797005005',
      members: [
        { name: 'Adnan Qureshi', age: 42, role: 'head' },
        { name: 'Rukhsar Qureshi', age: 38, role: 'member' },
        { name: 'Hamza Qureshi', age: 16, role: 'member' },
        { name: 'Mahnoor Qureshi', age: 12, role: 'member' },
      ],
    },
  ]

  const createdFamilies = []
  for (const f of familyData) {
    const family = await prisma.family.create({
      data: {
        familyName: f.familyName,
        address: f.address,
        phone: f.phone,
        members: { create: f.members },
      },
      include: { members: true },
    })
    createdFamilies.push(family)
    console.log(`✅ Family created: ${family.familyName} (${family.members.length} members)`)
  }

  // Contributions for last 3 months
  const now = new Date()
  const months = []
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const amountPerMember = 50

  for (const family of createdFamilies) {
    const memberCount = family.members.length
    const due = memberCount * amountPerMember

    for (let i = 0; i < months.length; i++) {
      const month = months[i]
      // Last month is unpaid for some, current month mixed
      const isPaid = i < 2 ? Math.random() > 0.2 : Math.random() > 0.5

      const contribution = await prisma.monthlyContribution.create({
        data: {
          familyId: family.id,
          amount: due,
          paidAmount: isPaid ? due : 0,
          month,
          status: isPaid ? 'paid' : 'unpaid',
        },
      })

      if (isPaid) {
        await prisma.transaction.create({
          data: {
            type: 'monthly_contribution',
            referenceId: contribution.id,
            familyId: family.id,
            familyName: family.familyName,
            description: `Monthly contribution - ${month}`,
            amount: due,
          },
        })
      }
    }
  }
  console.log('✅ Contributions seeded for', months.join(', '))

  // Donations
  const donations = [
    { donorName: 'Anonymous', familyId: null, amount: 500, type: 'zakat', note: 'Zakat ul Fitr' },
    { donorName: 'Muhammad Ahmad', familyId: createdFamilies[0].id, amount: 1000, type: 'sadaqah', note: 'For masjid renovation' },
    { donorName: 'Rashid Khan', familyId: createdFamilies[1].id, amount: 2000, type: 'zakat', note: '' },
    { donorName: 'Anonymous', familyId: null, amount: 300, type: 'fitrah', note: 'Sadaqah Fitrah' },
    { donorName: 'Bilal Sheikh', familyId: createdFamilies[3].id, amount: 5000, type: 'sadaqah', note: 'Electricity bill donation' },
  ]

  for (const d of donations) {
    const donation = await prisma.donation.create({ data: d })
    await prisma.transaction.create({
      data: {
        type: 'donation',
        referenceId: donation.id,
        familyId: d.familyId || null,
        familyName: d.donorName || 'Anonymous',
        description: `${d.type} donation${d.note ? ': ' + d.note : ''}`,
        amount: d.amount,
      },
    })
  }
  console.log('✅ Donations seeded')

  console.log('\n🎉 Seed complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin login: admin@masjid.com')
  console.log('Password:    admin123')
  console.log('URL:         http://localhost:3000')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
