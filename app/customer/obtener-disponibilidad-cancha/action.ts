"use server";

import { db } from "@/db";
import { field, timeslot, fieldTimeslot } from "@/app-schema";
import { eq } from "drizzle-orm";

// Obtener todas las canchas activas
export async function getAvailableFields() {
  const fields = await db
    .select({
      id: field.id,
      name: field.name,
      type: field.typeField,
      isActive: field.isActive,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt,
    })
    .from(field)
    .where(eq(field.isActive, true));
  return fields;
}

// Obtener los horarios por cancha
export async function getFieldTimeslots(fieldId: string) {
  const slots = await db
    .select({
      id: timeslot.id,
      dayOfWeek: timeslot.dayOfWeek,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      surchargePercent: timeslot.surchargePercent,
      isActive: timeslot.isActive,
    })
    .from(fieldTimeslot)
    .innerJoin(timeslot, eq(fieldTimeslot.timeslotId, timeslot.id))
    .where(eq(fieldTimeslot.fieldId, fieldId));

  return slots;
}

// Obtener todas las canchas con sus horarios
export async function getFullAvailability() {
  const fields = await getAvailableFields();

  const result = [];

  for (const f of fields) {
    const slots = await getFieldTimeslots(f.id);
    result.push({
      ...f,
      timeslots: slots,
    });
  }

  return result;
}
