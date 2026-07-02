import { getDb } from '@/db'
import {
  users,
  apis,
  apiCosts,
  teams,
  teamAPIs,
  alerts,
  alertHistories,
} from '@/db/schema'
import { eq, and, gte, lte, desc, asc, sql, inArray } from 'drizzle-orm'

// User Repository
export async function getUserById(userId: string) {
  const db = getDb()
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  })
}

export async function createUser(data: {
  id: string
  email: string
  name: string
  currency: string
}) {
  const db = getDb()
  return db.insert(users).values(data).run()
}

// API Repository
export async function getAPIsByUserId(userId: string) {
  const db = getDb()
  return db.query.apis.findMany({
    where: eq(apis.userId, userId),
    with: {
      costs: true,
    },
  })
}

export async function getAPIById(apiId: string) {
  const db = getDb()
  return db.query.apis.findFirst({
    where: eq(apis.id, apiId),
    with: {
      costs: true,
      teamAPIs: true,
    },
  })
}

export async function createAPI(data: {
  id: string
  userId: string
  name: string
  provider: string
  monthlyBudget?: number
  status: string
}) {
  const db = getDb()
  return db.insert(apis).values(data).run()
}

export async function updateAPI(apiId: string, data: Partial<typeof apis.$inferInsert>) {
  const db = getDb()
  return db
    .update(apis)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(apis.id, apiId))
    .run()
}

// API Costs Repository
export async function getAPICostsByMonth(apiId: string, month: string) {
  const db = getDb()
  return db.query.apiCosts.findFirst({
    where: and(eq(apiCosts.apiId, apiId), eq(apiCosts.month, month)),
  })
}

export async function getAPICostsHistory(apiId: string, months: string[]) {
  const db = getDb()
  return db.query.apiCosts.findMany({
    where: and(
      eq(apiCosts.apiId, apiId),
      inArray(apiCosts.month, months)
    ),
  })
}

export async function createAPICost(data: {
  id: string
  apiId: string
  month: string
  cost: number
  usage?: number
}) {
  const db = getDb()
  return db.insert(apiCosts).values(data).run()
}

export async function getTotalCostByMonth(userId: string, month: string) {
  const db = getDb()
  const userAPIs = await getAPIsByUserId(userId)
  const apiIds = userAPIs.map((a) => a.id)

  if (apiIds.length === 0) return 0

  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${apiCosts.cost}), 0)`,
    })
    .from(apiCosts)
    .where(
      and(
        inArray(apiCosts.apiId, apiIds),
        eq(apiCosts.month, month)
      )
    )

  return Number(result[0]?.total ?? 0)
}

// Team Repository
export async function getTeamsByUserId(userId: string) {
  const db = getDb()
  return db.query.teams.findMany({
    where: eq(teams.userId, userId),
    with: {
      teamAPIs: {
        with: {
          api: true,
        },
      },
    },
  })
}

export async function getTeamById(teamId: string) {
  const db = getDb()
  return db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    with: {
      teamAPIs: {
        with: {
          api: true,
        },
      },
    },
  })
}

export async function createTeam(data: {
  id: string
  userId: string
  name: string
}) {
  const db = getDb()
  return db.insert(teams).values(data).run()
}

// Team APIs Repository
export async function assignAPIToTeam(data: {
  id: string
  teamId: string
  apiId: string
  allocatedBudget?: number
}) {
  const db = getDb()
  return db.insert(teamAPIs).values(data).run()
}

export async function getTeamAPICost(teamId: string, month: string) {
  const db = getDb()
  const team = await getTeamById(teamId)
  if (!team) return 0

  const apiIds = team.teamAPIs.map((ta) => ta.apiId)
  if (apiIds.length === 0) return 0

  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${apiCosts.cost}), 0)`,
    })
    .from(apiCosts)
    .where(
      and(
        inArray(apiCosts.apiId, apiIds),
        eq(apiCosts.month, month)
      )
    )

  return Number(result[0]?.total ?? 0)
}

// Alert Repository
export async function getAlertsByUserId(userId: string) {
  const db = getDb()
  return db.query.alerts.findMany({
    where: eq(alerts.userId, userId),
    with: {
      histories: {
        orderBy: desc(alertHistories.triggerDate),
      },
    },
  })
}

export async function createAlert(data: {
  id: string
  userId: string
  type: string
  threshold?: number
  channel: string
  isActive: boolean
}) {
  const db = getDb()
  return db.insert(alerts).values(data).run()
}

export async function updateAlert(alertId: string, data: Partial<typeof alerts.$inferInsert>) {
  const db = getDb()
  return db
    .update(alerts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(alerts.id, alertId))
    .run()
}

// Alert History Repository
export async function createAlertHistory(data: {
  id: string
  alertId: string
  triggerDate: Date
  message: string
  status: string
}) {
  const db = getDb()
  return db.insert(alertHistories).values(data).run()
}

export async function getAlertHistories(alertId: string) {
  const db = getDb()
  return db.query.alertHistories.findMany({
    where: eq(alertHistories.alertId, alertId),
    orderBy: desc(alertHistories.triggerDate),
  })
}
