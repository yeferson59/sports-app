"use server";

import { db } from "@/db";
import { field, timeslot, price, booking } from "@/app-schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { auth } from "@/auth";

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

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

// Obtener disponibilidad de una cancha para un día específico
export async function getAvailableSlots(fieldId: string, dayOfWeek: DayOfWeek) {
  const slots = await db
    .select({
      id: timeslot.id,
      fieldId: timeslot.fieldId,
      dayOfWeek: timeslot.dayOfWeek,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      isActive: timeslot.isActive,
      priceAmount: price.priceAmount,
    })
    .from(timeslot)
    .innerJoin(price, eq(timeslot.id, price.timeslotId))
    .where(
      and(
        eq(timeslot.fieldId, fieldId),
        eq(timeslot.dayOfWeek, dayOfWeek),
        eq(timeslot.isActive, true)
      )
    )
    .orderBy(timeslot.startTime);

  return slots;
}

// Crear una reserva
export async function createBooking(
  fieldId: string,
  timeslotId: string,
  userId: string,
  withInstructor: boolean = false
) {
  try {
    if (!userId) {
      throw new Error("No estás autenticado");
    }

    // Obtener el timeslot y precio
    const timeslotData = await db
      .select({
        id: timeslot.id,
        fieldId: timeslot.fieldId,
      })
      .from(timeslot)
      .where(eq(timeslot.id, timeslotId))
      .limit(1);

    if (timeslotData.length === 0) {
      throw new Error("Horario no encontrado");
    }

    // Obtener el precio
    const priceData = await db
      .select({
        id: price.id,
        priceAmount: price.priceAmount,
        currency: price.currency,
      })
      .from(price)
      .where(eq(price.timeslotId, timeslotId))
      .limit(1);

    if (priceData.length === 0) {
      throw new Error("Precio no configurado");
    }

    // Verificar que no haya doble reserva
    const existingBooking = await db
      .select({ id: booking.id })
      .from(booking)
      .where(
        and(
          eq(booking.timeslotId, timeslotId),
          eq(booking.fieldId, fieldId),
          eq(booking.status, "confirmed")
        )
      )
      .limit(1);

    if (existingBooking.length > 0) {
      throw new Error("Este horario ya está reservado");
    }

    // Crear la reserva
    const newBooking = await db
      .insert(booking)
      .values({
        fieldId,
        userId,
        timeslotId,
        priceId: priceData[0].id,
        priceSnapshot: priceData[0].priceAmount,
        currencySnapshot: priceData[0].currency,
        withInstructor,
        status: "confirmed",
      })
      .returning();

    return {
      success: true,
      booking: newBooking[0],
      message: "¡Reserva confirmada exitosamente!",
    };
  } catch (error: any) {
    throw new Error(error.message || "Error al crear la reserva");
  }
}

// Obtener mis reservas
export async function getMyBookings(userId: string) {
  try {
    if (!userId) {
      throw new Error("No estás autenticado");
    }

    const myBookings = await db
      .select({
        id: booking.id,
        fieldName: field.name,
        fieldType: field.typeField,
        dayOfWeek: timeslot.dayOfWeek,
        startTime: timeslot.startTime,
        endTime: timeslot.endTime,
        price: booking.priceSnapshot,
        currency: booking.currencySnapshot,
        withInstructor: booking.withInstructor,
        status: booking.status,
        createdAt: booking.createdAt,
      })
      .from(booking)
      .leftJoin(field, eq(booking.fieldId, field.id))
      .leftJoin(timeslot, eq(booking.timeslotId, timeslot.id))
      .where(
        and(
          eq(booking.userId, userId),
          eq(booking.status, "confirmed")
        )
      )
      .orderBy(timeslot.startTime);

    return myBookings;
  } catch (error: any) {
    throw new Error(error.message || "Error al obtener reservas");
  }
}

// Cancelar reserva
export async function cancelBooking(bookingId: string, userId: string) {
  try {
    if (!userId) {
      throw new Error("No estás autenticado");
    }

    // Verificar que la reserva pertenece al usuario
    const existingBooking = await db
      .select({ id: booking.id })
      .from(booking)
      .where(
        and(
          eq(booking.id, bookingId),
          eq(booking.userId, userId)
        )
      )
      .limit(1);

    if (existingBooking.length === 0) {
      throw new Error("Reserva no encontrada");
    }

    // Cancelar
    const cancelled = await db
      .update(booking)
      .set({ status: "cancelled" })
      .where(eq(booking.id, bookingId))
      .returning();

    return {
      success: true,
      booking: cancelled[0],
      message: "Reserva cancelada",
    };
  } catch (error: any) {
    throw new Error(error.message || "Error al cancelar la reserva");
  }
}
