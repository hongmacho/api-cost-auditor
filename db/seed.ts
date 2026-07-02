import { getDb } from './index'
import { users, apis, apiCosts, teams, teamAPIs, alerts } from './schema'
import { v4 as uuid } from 'uuid'

export async function seedDatabase() {
  const db = getDb()

  // Create test user
  const userId = 'demo-user-1'
  db.insert(users).values({
    id: userId,
    email: 'demo@example.com',
    name: '데모 사용자',
    currency: 'KRW',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).run()

  // Create test teams
  const teamIds = [
    { id: uuid(), name: '백엔드팀' },
    { id: uuid(), name: '프론트엔드팀' },
    { id: uuid(), name: '데이터팀' },
  ]

  teamIds.forEach((team) => {
    db.insert(teams).values({
      id: team.id,
      userId,
      name: team.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).run()
  })

  // Create test APIs
  const apiData = [
    { name: 'Stripe API', provider: 'Stripe', budget: 500000 },
    { name: 'OpenAI API', provider: 'OpenAI', budget: 1000000 },
    { name: 'Twilio SMS', provider: 'Twilio', budget: 200000 },
    { name: 'SendGrid Email', provider: 'SendGrid', budget: 150000 },
    { name: 'AWS S3', provider: 'AWS', budget: 300000 },
    { name: 'Firebase', provider: 'Google', budget: 250000 },
    { name: 'Datadog Monitoring', provider: 'Datadog', budget: 400000 },
  ]

  const apiIds: { id: string; name: string }[] = []

  apiData.forEach((api) => {
    const apiId = uuid()
    apiIds.push({ id: apiId, name: api.name })

    db.insert(apis).values({
      id: apiId,
      userId,
      name: api.name,
      provider: api.provider,
      monthlyBudget: api.budget,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).run()
  })

  // Create cost records for the last 3 months
  const today = new Date()
  const months = [
    {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      label: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
    },
    {
      year: today.getFullYear(),
      month: today.getMonth(),
      label: `${today.getFullYear()}-${String(today.getMonth()).padStart(2, '0')}`,
    },
    {
      year: today.getFullYear(),
      month: today.getMonth() - 1,
      label: `${today.getFullYear()}-${String(today.getMonth() - 1).padStart(2, '0')}`,
    },
  ]

  apiIds.forEach((api, index) => {
    months.forEach((month) => {
      const baseCost = apiData[index].budget
      const variance = Math.random() * 0.3 - 0.15 // -15% to +15% variance
      const cost = baseCost * (1 + variance)

      db.insert(apiCosts).values({
        id: uuid(),
        apiId: api.id,
        month: month.label,
        cost: Math.round(cost * 100) / 100,
        usage: Math.floor(Math.random() * 100000) + 10000,
        createdAt: new Date(),
      }).run()
    })
  })

  // Assign APIs to teams
  apiIds.forEach((api, index) => {
    const teamId = teamIds[index % teamIds.length].id
    const allocatedBudget = apiData[index].budget * 0.7

    db.insert(teamAPIs).values({
      id: uuid(),
      teamId,
      apiId: api.id,
      allocatedBudget,
      createdAt: new Date(),
    }).run()
  })

  // Create alert
  db.insert(alerts).values({
    id: uuid(),
    userId,
    type: 'threshold',
    threshold: 3000000,
    channel: 'in-app',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).run()

  console.log('✓ Database seeded successfully')
}

// Run seed if executed directly
if (require.main === module) {
  seedDatabase().catch(console.error)
}
