"use server";

import { db } from "@/db";
import { field, timeslot } from "@/app-schema";
import { eq } from "drizzle-orm";

// Obtener todas las canchas activas
export async function getAvailableFields() {
  const fields = await db.select().from(field).where(eq(field.isActive, true));
  return fields;
}

// Obtener los horarios por cancha
export async function getFieldTimeslots(fieldId: string) {
  const slots = await db
    .select()
    .from(timeslot)
    .where(eq(timeslot.fieldId, fieldId));

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
