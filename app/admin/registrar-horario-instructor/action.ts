"use server";

import { db } from "@/db";
import { timeslot } from "@/app-schema";
import { user } from "@/auth-schema";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { role } from "@/auth-schema";

interface AssignTimeslotToInstructorData {
  timeslot_ids: string[];
  instructor_id: string;
}

// Obtener todos los instructores
export async function getInstructors() {
  const instructors = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .innerJoin(role, eq(user.roleId, role.id))
    .where(eq(role.name, "instructor"));

  return instructors;
}

// Obtener franjas horarias disponibles (sin instructor asignado)
export async function getAvailableTimeslotsForInstructor() {
  // Obtener solo franjas sin instructor asignado (userId es null)
  const availableSlots = await db
    .select({
      id: timeslot.id,
      dayOfWeek: timeslot.dayOfWeek,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      surchargePercent: timeslot.surchargePercent,
      isActive: timeslot.isActive,
    })
    .from(timeslot)
    .where(isNull(timeslot.userId));

  return availableSlots;
}

// Obtener franjas horarias asignadas a un instructor
export async function getInstructorTimeslots(instructorId: string) {
  const instructorSlots = await db
    .select({
      id: timeslot.id,
      dayOfWeek: timeslot.dayOfWeek,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      surchargePercent: timeslot.surchargePercent,
      isActive: timeslot.isActive,
    })
    .from(timeslot)
    .where(eq(timeslot.userId, instructorId));

  return instructorSlots;
}

// Asignar franjas horarias a un instructor
export async function assignTimeslotsToInstructor(
  data: AssignTimeslotToInstructorData,
) {
  const { timeslot_ids, instructor_id } = data;

  // Validar que haya al menos una franja
  if (!timeslot_ids || timeslot_ids.length === 0) {
    throw new Error("Debes seleccionar al menos una franja horaria.");
  }

  // Validar que el instructor exista y sea instructor
  const instructorData = await db
    .select({
      id: user.id,
      roleName: role.name,
    })
    .from(user)
    .innerJoin(role, eq(user.roleId, role.id))
    .where(eq(user.id, instructor_id))
    .limit(1);

  if (instructorData.length === 0) {
    throw new Error("El instructor seleccionado no existe.");
  }

  if (instructorData[0].roleName !== "instructor") {
    throw new Error("El usuario seleccionado no es un instructor.");
  }

  // Validar que las franjas existan
  const slots = await db
    .select({ id: timeslot.id })
    .from(timeslot)
    .where(inArray(timeslot.id, timeslot_ids));

  if (slots.length !== timeslot_ids.length) {
    throw new Error("Algunas franjas horarias no existen.");
  }

  // Verificar que las franjas no estén ya asignadas a NINGÚN instructor
  const existingAssignments = await db
    .select({
      id: timeslot.id,
      userId: timeslot.userId,
    })
    .from(timeslot)
    .where(inArray(timeslot.id, timeslot_ids));

  const alreadyAssigned = existingAssignments.filter((t) => t.userId !== null);

  if (alreadyAssigned.length > 0) {
    throw new Error(
      `${alreadyAssigned.length} franja(s) ya están asignadas a otro instructor.`,
    );
  }

  // Asignar instructor a las franjas
  await db
    .update(timeslot)
    .set({ userId: instructor_id })
    .where(inArray(timeslot.id, timeslot_ids));

  return {
    success: true,
    message: `Se asignaron ${timeslot_ids.length} franjas horarias al instructor correctamente.`,
  };
}

// Desasignar franjas horarias de un instructor
export async function unassignTimeslotsFromInstructor(
  instructor_id: string,
  timeslot_ids: string[],
) {
  if (!timeslot_ids || timeslot_ids.length === 0) {
    throw new Error("Debes seleccionar al menos una franja horaria.");
  }

  // Liberar las franjas (poner userId en null)
  await db
    .update(timeslot)
    .set({ userId: null })
    .where(
      and(
        eq(timeslot.userId, instructor_id),
        inArray(timeslot.id, timeslot_ids),
      ),
    );

  return {
    success: true,
    message: `Se liberaron ${timeslot_ids.length} franjas horarias del instructor.`,
  };
}

// Obtener instructores disponibles para una franja específica
export async function getAvailableInstructorsForSlot(timeslotId: string) {
  // Obtener la franja para saber qué día y hora es
  const slotData = await db
    .select({
      dayOfWeek: timeslot.dayOfWeek,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
    })
    .from(timeslot)
    .where(eq(timeslot.id, timeslotId))
    .limit(1);

  if (slotData.length === 0) {
    return [];
  }

  const slot = slotData[0];

  // Obtener todos los instructores que tienen ese horario disponible
  const availableInstructors = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .innerJoin(role, eq(user.roleId, role.id))
    .innerJoin(timeslot, eq(user.id, timeslot.userId))
    .where(
      and(
        eq(role.name, "instructor"),
        eq(timeslot.dayOfWeek, slot.dayOfWeek),
        eq(timeslot.startTime, slot.startTime),
        eq(timeslot.endTime, slot.endTime),
      ),
    );

  return availableInstructors;
}
