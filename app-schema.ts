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
    fieldId: uuid("field_id").references(() => field.id),
    userId: text("user_id").references(() => user.id),
    dayOfWeek: weekday("day_of_week").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("timeslot_field_idx").on(t.fieldId),
    index("timeslot_user_idx").on(t.userId),
    index("timeslot_day_idx").on(t.dayOfWeek),
  ],
);

export const price = pgTable(
  "price",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => field.id),
    timeslotId: uuid("timeslot_id")
      .notNull()
      .references(() => timeslot.id),
    priceAmount: numeric("price_amount").notNull(),
    currency: text("currency").default("COP").notNull(),
    validFrom: timestamp("valid_from"),
    validTo: timestamp("valid_to"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (p) => [
    index("price_field_idx").on(p.fieldId),
    index("price_timeslot_idx").on(p.timeslotId),
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
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    priceId: uuid("price_id").references(() => price.id),
    priceSnapshot: numeric("price_snapshot"),
    currencySnapshot: text("currency_snapshot"),
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
    index("booking_instructor_time_idx").on(
      b.instructorId,
      b.startTime,
      b.endTime,
    ),
  ],
);

export const fieldRelations = relations(field, ({ many }) => ({
  timeslots: many(timeslot),
  prices: many(price),
  bookings: many(booking),
}));

export const timeslotRelations = relations(timeslot, ({ one, many }) => ({
  field: one(field, { fields: [timeslot.fieldId], references: [field.id] }),
  user: one(user, { fields: [timeslot.userId], references: [user.id] }),
  prices: many(price),
  bookings: many(booking),
}));

export const priceRelations = relations(price, ({ one, many }) => ({
  field: one(field, { fields: [price.fieldId], references: [field.id] }),
  timeslot: one(timeslot, {
    fields: [price.timeslotId],
    references: [timeslot.id],
  }),
  bookings: many(booking),
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
  price: one(price, { fields: [booking.priceId], references: [price.id] }),
}));

export const schema = {
  field,
  timeslot,
  price,
  booking,
  enums: {
    fieldType,
    weekday,
  },
};
