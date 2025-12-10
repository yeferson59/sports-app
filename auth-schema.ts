import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";

export const roleName = pgEnum("role_enum", ["client", "admin", "instructor"]);

// Enum para días de la semana
export const weekdayEnum = pgEnum("weekday_enum", [
  "monday",
  "tuesday", 
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]);

export const role = pgTable("role", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: roleName("name").unique().notNull(),
});

export const field = pgTable("field", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ========== TABLA TIMESLOT ==========
export const timeslot = pgTable("timeslot", {
  id: uuid("id").primaryKey().defaultRandom(),
  field_id: uuid("field_id")
    .notNull()
    .references(() => field.id, { onDelete: "cascade" }),
  user_id: text("user_id").default(sql`NULL`),
  day_of_week: weekdayEnum("day_of_week").notNull(),
  start_time: text("start_time").notNull(),
  end_time: text("end_time").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
// ====================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  roleId: uuid("role_id")
    .notNull()
    .references(() => role.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ========== RELACIONES ==========
export const fieldRelations = relations(field, ({ many }) => ({
  timeslots: many(timeslot),
}));

export const timeslotRelations = relations(timeslot, ({ one }) => ({
  field: one(field, {
    fields: [timeslot.field_id],
    references: [field.id],
  }),
  user: one(user, {
    fields: [timeslot.user_id],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  role: one(role, {
    fields: [user.roleId],
    references: [role.id],
  }),
  sessions: many(session),
  accounts: many(account),
  timeslots: many(timeslot),
}));

export const roleRelations = relations(role, ({ many }) => ({
  users: many(user),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const schemaAuth = {
  role,
  user,
  verification,
  account,
  session,
  field,
  timeslot,
};