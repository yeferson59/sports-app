"use server";

import { db } from "@/db";
import { field, timeslot, fieldTimeslot, price } from "@/app-schema";
import { eq, and, inArray } from "drizzle-orm";

interface AssignTimeslotData {
  timeslot_ids: string[];
  field_id: string;
  user_id?: string;
  base_price?: string;
  instructor_price?: string;
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

// Obtener franjas horarias disponibles para asignar a una cancha
export async function getAvailableTimeslots(fieldId: string) {
  // Obtener todas las franjas
  const allSlots = await db
    .select({
      id: timeslot.id,
      dayOfWeek: timeslot.dayOfWeek,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      isActive: timeslot.isActive,
    })
    .from(timeslot);

  // Obtener franjas YA asignadas a esta cancha
  const assignedToField = await db
    .select({
      timeslotId: fieldTimeslot.timeslotId,
    })
    .from(fieldTimeslot)
    .where(eq(fieldTimeslot.fieldId, fieldId));

  const assignedTimeslotIds = new Set(
    assignedToField.map((ft) => ft.timeslotId),
  );

  // Filtrar solo las que NO están asignadas a esta cancha
  const availableSlots = allSlots.filter(
    (slot) => !assignedTimeslotIds.has(slot.id),
  );

  return availableSlots;
}

// Obtener franjas horarias asignadas a una cancha
export async function getFieldTimeslots(fieldId: string) {
  const fieldSlots = await db
    .select({
      id: timeslot.id,
      fieldTimeslotId: fieldTimeslot.id,
      dayOfWeek: timeslot.dayOfWeek,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      surchargePercent: timeslot.surchargePercent,
      isActive: timeslot.isActive,
      basePrice: price.basePrice,
      instructorPrice: price.instructorPrice,
    })
    .from(fieldTimeslot)
    .innerJoin(timeslot, eq(fieldTimeslot.timeslotId, timeslot.id))
    .leftJoin(price, eq(fieldTimeslot.id, price.fieldTimeslotId))
    .where(eq(fieldTimeslot.fieldId, fieldId));

  return fieldSlots;
}

// Asignar franjas horarias a una cancha
export async function assignTimeslotsToField(data: AssignTimeslotData) {
  const { timeslot_ids, field_id, base_price, instructor_price } = data;

  // Validar que haya al menos una franja
  if (!timeslot_ids || timeslot_ids.length === 0) {
    throw new Error("Debes seleccionar al menos una franja horaria.");
  }

  // Validar que la cancha exista
  const existingField = await db
    .select({ id: field.id, typeField: field.typeField })
    .from(field)
    .where(eq(field.id, field_id))
    .limit(1);

  if (existingField.length === 0) {
    throw new Error("La cancha seleccionada no existe.");
  }

  // Validar que las franjas existan
  const slots = await db
    .select({ id: timeslot.id })
    .from(timeslot)
    .where(inArray(timeslot.id, timeslot_ids));

  if (slots.length !== timeslot_ids.length) {
    throw new Error("Algunas franjas horarias no existen.");
  }

  // Verificar que no existan asignaciones duplicadas
  const existingAssignments = await db
    .select({ timeslotId: fieldTimeslot.timeslotId })
    .from(fieldTimeslot)
    .where(
      and(
        eq(fieldTimeslot.fieldId, field_id),
        inArray(fieldTimeslot.timeslotId, timeslot_ids),
      ),
    );

  if (existingAssignments.length > 0) {
    throw new Error(
      `${existingAssignments.length} franja(s) ya están asignadas a esta cancha.`,
    );
  }

  // Determinar precios por defecto según tipo de cancha
  const basePrices = {
    "futbol-6": "100000",
    padel: "120000",
  };
  const instructorPrices = {
    "futbol-6": "0", // Sin instructor para fútbol
    padel: "50000", // $50,000 por instructor en pádel
  };

  const fieldType = existingField[0].typeField;
  const basePriceToUse = base_price || basePrices[fieldType];
  const instructorPriceToUse = instructor_price || instructorPrices[fieldType];

  // Crear relación cancha-franja y precio
  for (const slotId of timeslot_ids) {
    // 1. Crear relación en field_timeslot
    const [fieldTimeslotRecord] = await db
      .insert(fieldTimeslot)
      .values({
        fieldId: field_id,
        timeslotId: slotId,
        isActive: true,
      })
      .returning();

    // 2. Crear precio para esta relación
    await db.insert(price).values({
      fieldTimeslotId: fieldTimeslotRecord.id,
      basePrice: basePriceToUse,
      instructorPrice: instructorPriceToUse,
      currency: "COP",
      isActive: true,
    });
  }

  return {
    success: true,
    message: `Se asignaron ${timeslot_ids.length} franjas horarias a la cancha correctamente.`,
  };
}

// Desasignar franjas horarias de una cancha
export async function unassignTimeslotsFromField(
  fieldId: string,
  timeslot_ids: string[],
) {
  if (!timeslot_ids || timeslot_ids.length === 0) {
    throw new Error("Debes seleccionar al menos una franja horaria.");
  }

  // Eliminar relaciones field_timeslot (cascade eliminará precios)
  await db
    .delete(fieldTimeslot)
    .where(
      and(
        eq(fieldTimeslot.fieldId, fieldId),
        inArray(fieldTimeslot.timeslotId, timeslot_ids),
      ),
    );

  return {
    success: true,
    message: `Se liberaron ${timeslot_ids.length} franjas horarias de esta cancha.`,
  };
}
