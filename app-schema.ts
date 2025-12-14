import {
  pgTable,
  uuid,
  text,
  pgEnum,
  boolean,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "@/auth-schema";

export const fieldType = pgEnum("field_type", ["futbol-6", "padel"]);

export const weekday = pgEnum("weekday_enum", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const field = pgTable("field", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  typeField: fieldType("type").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const timeslot = pgTable(
  "timeslot",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id), // Instructor asignado
    dayOfWeek: weekday("day_of_week").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    surchargePercent: numeric("surcharge_percent").default("0").notNull(), // % sobrecargo (ej: 2 para 2%)
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("timeslot_user_idx").on(t.userId),
    index("timeslot_day_idx").on(t.dayOfWeek),
  ],
);

// Tabla intermedia: Relaciona canchas con franjas horarias
export const fieldTimeslot = pgTable(
  "field_timeslot",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => field.id, { onDelete: "cascade" }),
    timeslotId: uuid("timeslot_id")
      .notNull()
      .references(() => timeslot.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (ft) => [
    index("field_timeslot_field_idx").on(ft.fieldId),
    index("field_timeslot_timeslot_idx").on(ft.timeslotId),
  ],
);

export const price = pgTable(
  "price",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fieldTimeslotId: uuid("field_timeslot_id")
      .notNull()
      .references(() => fieldTimeslot.id, { onDelete: "cascade" }),
    basePrice: numeric("base_price").notNull(), // Precio base sin sobrecargos
    instructorPrice: numeric("instructor_price").default("0").notNull(), // Costo adicional del instructor
    currency: text("currency").default("COP").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (p) => [
    index("price_field_timeslot_idx").on(p.fieldTimeslotId),
  ],
);

export const booking = pgTable(
  "booking",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => field.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    withInstructor: boolean("with_instructor").default(false).notNull(),
    instructorId: text("instructor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    timeslotId: uuid("timeslot_id").references(() => timeslot.id),
    fieldTimeslotId: uuid("field_timeslot_id").references(() => fieldTimeslot.id),
    // Snapshot del precio calculado al momento de la reserva
    basePriceSnapshot: numeric("base_price_snapshot").notNull(),
    surchargeSnapshot: numeric("surcharge_snapshot").default("0").notNull(), // % aplicado
    instructorPriceSnapshot: numeric("instructor_price_snapshot").default("0").notNull(),
    totalPrice: numeric("total_price").notNull(), // Precio final calculado
    currency: text("currency").default("COP").notNull(),
    status: text("status").default("confirmed").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (b) => [
    index("booking_field_idx").on(b.fieldId),
    index("booking_user_idx").on(b.userId),
    index("booking_timeslot_idx").on(b.timeslotId),
    index("booking_instructor_time_idx").on(b.instructorId),
  ],
);

export const fieldRelations = relations(field, ({ many }) => ({
  fieldTimeslots: many(fieldTimeslot),
  bookings: many(booking),
}));

export const timeslotRelations = relations(timeslot, ({ one, many }) => ({
  instructor: one(user, { fields: [timeslot.userId], references: [user.id] }),
  fieldTimeslots: many(fieldTimeslot),
  bookings: many(booking),
}));

export const fieldTimeslotRelations = relations(fieldTimeslot, ({ one }) => ({
  field: one(field, { fields: [fieldTimeslot.fieldId], references: [field.id] }),
  timeslot: one(timeslot, { fields: [fieldTimeslot.timeslotId], references: [timeslot.id] }),
  price: one(price, { fields: [fieldTimeslot.id], references: [price.fieldTimeslotId] }),
}));

export const priceRelations = relations(price, ({ one }) => ({
  fieldTimeslot: one(fieldTimeslot, {
    fields: [price.fieldTimeslotId],
    references: [fieldTimeslot.id],
  }),
}));

export const bookingRelations = relations(booking, ({ one }) => ({
  field: one(field, { fields: [booking.fieldId], references: [field.id] }),
  user: one(user, { fields: [booking.userId], references: [user.id] }),
  instructor: one(user, {
    fields: [booking.instructorId],
    references: [user.id],
  }),
  timeslot: one(timeslot, {
    fields: [booking.timeslotId],
    references: [timeslot.id],
  }),
  fieldTimeslot: one(fieldTimeslot, {
    fields: [booking.fieldTimeslotId],
    references: [fieldTimeslot.id],
  }),
}));

export const schema = {
  field,
  timeslot,
  fieldTimeslot,
  price,
  booking,
  enums: {
    fieldType,
    weekday,
  },
};
