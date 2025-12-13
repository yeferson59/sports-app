"use server";

import { db } from "@/db";
import { field, timeslot } from "@/app-schema";
import { eq } from "drizzle-orm";

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

  // Insertar usando Drizzle ORM
  const insertedSlots = [];

  for (const slot of timeSlots) {
    // Convertir HH:MM a timestamp
    const startDate = new Date(`2000-01-01T${slot.start_time}:00`);
    const endDate = new Date(`2000-01-01T${slot.end_time}:00`);

    try {
      const result = await db
        .insert(timeslot)
        .values({
          fieldId: slot.field_id,
          dayOfWeek: slot.day_of_week,
          startTime: startDate,
          endTime: endDate,
          isActive: slot.is_active,
        })
        .returning();

      if (result && result.length > 0) {
        insertedSlots.push(result[0]);
      }
    } catch (error) {
      console.error(`Error inserting timeslot for field ${slot.field_id}:`, error);
      throw error;
    }
  }

  return {
    success: true,
    timeslots: insertedSlots,
    message: `Se registraron ${insertedSlots.length} horarios correctamente.`,
  };
}
