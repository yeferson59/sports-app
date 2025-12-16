import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  uuid,
  numeric,
  char,
} from "drizzle-orm/pg-core";

export const roleName = pgEnum("role_enum", ["client", "admin", "instructor"]);

// Enum para días de la semana - FALTABA ESTO
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

// Definir field ANTES de booking y timeslot - FALTABA ESTO
export const field = pgTable("field", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  roleId: uuid("role_id")
    .notNull()
    .references(() => role.id),
  numberPhone: char("number_phone", { length: 10 }),
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

export const booking = pgTable("booking", {
  id: uuid("id").primaryKey(),
  field_id: uuid("field_id").notNull().references(() => field.id),
  user_id: text("user_id").notNull().references(() => user.id),
  with_instructor: boolean("with_instructor").notNull(),
  instructor_id: text("instructor_id"),
  timeslot_id: uuid("timeslot_id"),
  field_timeslot_id: uuid("field_timeslot_id"),
  base_price_snapshot: numeric("base_price_snapshot").notNull(),
  surcharge_snapshot: numeric("surcharge_snapshot").notNull(),
  instructor_price_snapshot: numeric("instructor_price_snapshot").notNull(),
  total_price: numeric("total_price").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userRelations = relations(user, ({ one, many }) => ({
  role: one(role, {
    fields: [user.roleId],
    references: [role.id],
  }),
  sessions: many(session),
  accounts: many(account),
  timeslots: many(timeslot),
  bookings: many(booking),
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

export const fieldRelations = relations(field, ({ many }) => ({
  timeslots: many(timeslot),
  bookings: many(booking),
}));

export const bookingRelations = relations(booking, ({ one }) => ({
  field: one(field, {
    fields: [booking.field_id],
    references: [field.id],
  }),
  user: one(user, {
    fields: [booking.user_id],
    references: [user.id],
  }),
  instructor: one(user, {
    fields: [booking.instructor_id],
    references: [user.id],
  }),
  timeslot: one(timeslot, {
    fields: [booking.timeslot_id],
    references: [timeslot.id],
  }),
}));

export const timeslotRelations = relations(timeslot, ({ one, many }) => ({
  field: one(field, {
    fields: [timeslot.field_id],
    references: [field.id],
  }),
  user: one(user, {
    fields: [timeslot.user_id],
    references: [user.id],
  }),
  bookings: many(booking),
}));

export const schemaAuth = {
  role,
  user,
  verification,
  account,
  session,
  field,
  timeslot,
  booking,
};