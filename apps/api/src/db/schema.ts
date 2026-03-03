import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  doublePrecision,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';

export const missionStatusEnum = pgEnum('mission_status', ['PLANNED', 'IN_PROGRESS', 'COMPLETED']);
export const severityEnum = pgEnum('report_severity', ['LOW', 'MEDIUM', 'HIGH']);
export const roleEnum = pgEnum('user_role', ['ADMIN', 'COORDINATOR', 'FIELD_CREW']);

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const missions = pgTable('missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 160 }).notNull(),
  region: varchar('region', { length: 120 }).notNull(),
  status: missionStatusEnum('status').default('PLANNED').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  scheduledStart: timestamp('scheduled_start', { withTimezone: true }).notNull(),
  scheduledEnd: timestamp('scheduled_end', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  email: varchar('email', { length: 160 }).notNull().unique(),
  displayName: varchar('display_name', { length: 120 }).notNull(),
  role: roleEnum('role').default('FIELD_CREW').notNull(),
  phone: varchar('phone', { length: 40 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  active: boolean('active').default(true).notNull(),
});

export const fieldReports = pgTable('field_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  missionId: uuid('mission_id')
    .notNull()
    .references(() => missions.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').references(() => users.id),
  authorName: varchar('author_name', { length: 120 }).notNull(),
  authorRole: roleEnum('author_role').default('FIELD_CREW'),
  summary: text('summary'),
  details: text('details').notNull(),
  severity: severityEnum('severity').default('LOW').notNull(),
  insights: jsonb('insights'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
  status: varchar('status', { length: 40 }).default('PENDING'),
});

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  missionId: uuid('mission_id')
    .notNull()
    .references(() => missions.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 120 }).notNull(),
  type: varchar('type', { length: 60 }).notNull(),
  storageKey: text('storage_key').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const missionRelations = relations(missions, ({ many, one }) => ({
  reports: many(fieldReports),
  assets: many(assets),
  organization: one(organizations, {
    fields: [missions.organizationId],
    references: [organizations.id],
  }),
}));

export const reportRelations = relations(fieldReports, ({ one }) => ({
  mission: one(missions, {
    fields: [fieldReports.missionId],
    references: [missions.id],
  }),
  author: one(users, {
    fields: [fieldReports.authorId],
    references: [users.id],
  }),
}));

export const assetRelations = relations(assets, ({ one }) => ({
  mission: one(missions, {
    fields: [assets.missionId],
    references: [missions.id],
  }),
}));

export const userRelations = relations(users, ({ many, one }) => ({
  reports: many(fieldReports),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationRelations = relations(organizations, ({ many }) => ({
  missions: many(missions),
  users: many(users),
}));
