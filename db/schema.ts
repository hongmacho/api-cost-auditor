import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  currency: text('currency').default('USD'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const apis = sqliteTable('apis', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  provider: text('provider').notNull(),
  monthlyBudget: real('monthly_budget'),
  status: text('status').default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const apiCosts = sqliteTable('api_costs', {
  id: text('id').primaryKey(),
  apiId: text('api_id').notNull().references(() => apis.id),
  month: text('month').notNull(),
  cost: real('cost').notNull(),
  usage: integer('usage'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const teamAPIs = sqliteTable('team_apis', {
  id: text('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id),
  apiId: text('api_id').notNull().references(() => apis.id),
  allocatedBudget: real('allocated_budget'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  threshold: real('threshold'),
  channel: text('channel').default('in-app'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const alertHistories = sqliteTable('alert_histories', {
  id: text('id').primaryKey(),
  alertId: text('alert_id').notNull().references(() => alerts.id),
  triggerDate: integer('trigger_date', { mode: 'timestamp' }).notNull(),
  message: text('message'),
  status: text('status').default('sent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  apis: many(apis),
  teams: many(teams),
  alerts: many(alerts),
}))

export const apisRelations = relations(apis, ({ one, many }) => ({
  user: one(users, {
    fields: [apis.userId],
    references: [users.id],
  }),
  costs: many(apiCosts),
  teamAPIs: many(teamAPIs),
}))

export const apiCostsRelations = relations(apiCosts, ({ one }) => ({
  api: one(apis, {
    fields: [apiCosts.apiId],
    references: [apis.id],
  }),
}))

export const teamsRelations = relations(teams, ({ one, many }) => ({
  user: one(users, {
    fields: [teams.userId],
    references: [users.id],
  }),
  teamAPIs: many(teamAPIs),
}))

export const teamAPIsRelations = relations(teamAPIs, ({ one }) => ({
  team: one(teams, {
    fields: [teamAPIs.teamId],
    references: [teams.id],
  }),
  api: one(apis, {
    fields: [teamAPIs.apiId],
    references: [apis.id],
  }),
}))

export const alertsRelations = relations(alerts, ({ one, many }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
  histories: many(alertHistories),
}))

export const alertHistoriesRelations = relations(alertHistories, ({ one }) => ({
  alert: one(alerts, {
    fields: [alertHistories.alertId],
    references: [alerts.id],
  }),
}))
