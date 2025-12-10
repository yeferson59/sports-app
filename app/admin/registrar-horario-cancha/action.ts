"use server";

import { db } from "@/db";
import { field } from "@/app-schema";
import { eq, sql } from "drizzle-orm";

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface TimeSlotData {
  field_id: string;
  start_time: string;
  end_time: string;
  day_of_week: DayOfWeek;
  is_active: boolean;
}

// Obtener todas las canchas activas
export async function getActiveFields() {
  const activeFields = await db
    .select({
      id: field.id,
      name: field.name,
      type: field.typeField,
    })
    .from(field)
    .where(eq(field.isActive, true));

  return activeFields;
}

// Guardar múltiples horarios
export async function saveTimeSlots(timeSlots: TimeSlotData[]) {
  // Validar que haya al menos un horario
  if (!timeSlots || timeSlots.length === 0) {
    throw new Error("Debes agregar al menos un horario.");
  }

  // Validar que todas las canchas existan
  const fieldIds = [...new Set(timeSlots.map((ts) => ts.field_id))];

  for (const fieldId of fieldIds) {
    const existingField = await db
      .select({ id: field.id })
      .from(field)
      .where(eq(field.id, fieldId))
      .limit(1);

    if (existingField.length === 0) {
      throw new Error(`La cancha con ID ${fieldId} no existe.`);
    }
  }

  // Validar formato de horas
  for (const slot of timeSlots) {
    if (!slot.start_time || !slot.end_time) {
      throw new Error("Todos los horarios deben tener hora de inicio y fin.");
    }

    // Validar que la hora fin sea mayor que la hora inicio
    const start = new Date(`2000-01-01T${slot.start_time}`);
    const end = new Date(`2000-01-01T${slot.end_time}`);

    if (end <= start) {
      throw new Error("La hora de fin debe ser mayor que la hora de inicio.");
    }
  }

  // Insertar usando SQL raw para evitar problemas con Drizzle
  const insertedSlots = [];

  for (const slot of timeSlots) {
    const result = await db.execute(sql`
      INSERT INTO timeslot (
        id,
        field_id,
        user_id,
        day_of_week,
        start_time,
        end_time,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${slot.field_id}::uuid,
        NULL,
        ${slot.day_of_week}::weekday_enum,
        ${slot.start_time}::text,
        ${slot.end_time}::text,
        ${slot.is_active}::boolean,
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    if (result && Array.isArray(result)) {
      insertedSlots.push(result[0]);
    }
  }

  return {
    success: true,
    timeslots: insertedSlots,
    message: `Se registraron ${insertedSlots.length} horarios correctamente.`,
  };
}
