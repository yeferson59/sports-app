"use server";

import { db } from "@/db";
import { field, timeslot, fieldTimeslot, price, booking } from "@/app-schema";
import { user } from "@/auth-schema";
import { eq, and } from "drizzle-orm";
import { role } from "@/auth-schema";

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

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
  // Obtener franjas con precios para esta cancha
  const slots = await db
    .select({
      id: timeslot.id,
      fieldTimeslotId: fieldTimeslot.id,
      fieldId: fieldTimeslot.fieldId,
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
    .where(
      and(
        eq(fieldTimeslot.fieldId, fieldId),
        eq(timeslot.dayOfWeek, dayOfWeek),
        eq(timeslot.isActive, true),
      ),
    )
    .orderBy(timeslot.startTime);

  // Obtener reservas confirmadas para filtrar las no disponibles
  const bookedSlots = await db
    .select({
      timeslotId: booking.timeslotId,
    })
    .from(booking)
    .where(and(eq(booking.fieldId, fieldId), eq(booking.status, "confirmed")));

  const bookedTimeslotIds = new Set(bookedSlots.map((b) => b.timeslotId));

  // Filtrar slots que no están reservados y calcular precio con sobrecargo
  const availableSlots = slots
    .filter((slot) => !bookedTimeslotIds.has(slot.id))
    .map((slot) => {
      const basePrice = parseFloat(slot.basePrice || "0");
      const surcharge = parseFloat(slot.surchargePercent || "0");
      const priceWithSurcharge = basePrice * (1 + surcharge / 100);

      return {
        ...slot,
        calculatedPrice: priceWithSurcharge.toString(),
      };
    });

  return availableSlots;
}

// Obtener instructor disponible para una franja específica (solo uno por franja)
export async function getAvailableInstructorsForSlot(timeslotId: string) {
  // Obtener el instructor asignado directamente a esta franja
  const instructorData = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(timeslot)
    .innerJoin(user, eq(timeslot.userId, user.id))
    .innerJoin(role, eq(user.roleId, role.id))
    .where(
      and(
        eq(timeslot.id, timeslotId),
        eq(role.name, "instructor")
      )
    )
    .limit(1);

  return instructorData;
}

// Crear una reserva
export async function createBooking(
  fieldId: string,
  timeslotId: string,
  userId: string,
  withInstructor: boolean = false,
  instructorId?: string,
) {
  try {
    if (!userId) {
      throw new Error("No estás autenticado");
    }

    // Obtener datos completos de la franja y precio
    const slotData = await db
      .select({
        timeslotId: timeslot.id,
        fieldTimeslotId: fieldTimeslot.id,
        surchargePercent: timeslot.surchargePercent,
        basePrice: price.basePrice,
        instructorPrice: price.instructorPrice,
        currency: price.currency,
      })
      .from(fieldTimeslot)
      .innerJoin(timeslot, eq(fieldTimeslot.timeslotId, timeslot.id))
      .innerJoin(price, eq(fieldTimeslot.id, price.fieldTimeslotId))
      .where(
        and(eq(fieldTimeslot.fieldId, fieldId), eq(timeslot.id, timeslotId)),
      )
      .limit(1);

    if (slotData.length === 0) {
      throw new Error("Horario no encontrado o no disponible");
    }

    const slot = slotData[0];

    // Verificar que no haya doble reserva
    const existingBooking = await db
      .select({ id: booking.id })
      .from(booking)
      .where(
        and(
          eq(booking.timeslotId, timeslotId),
          eq(booking.fieldId, fieldId),
          eq(booking.status, "confirmed"),
        ),
      )
      .limit(1);

    if (existingBooking.length > 0) {
      throw new Error("Este horario ya está reservado");
    }

    // Calcular precio total
    const basePrice = parseFloat(slot.basePrice);
    const surcharge = parseFloat(slot.surchargePercent);
    const instructorPrice = withInstructor
      ? parseFloat(slot.instructorPrice)
      : 0;

    const priceWithSurcharge = basePrice * (1 + surcharge / 100);
    const totalPrice = priceWithSurcharge + instructorPrice;

    // Validar que el instructor esté disponible para esta franja si se solicita
    if (withInstructor && instructorId) {
      const instructorAvailable = await db
        .select({ id: timeslot.id })
        .from(timeslot)
        .where(
          and(eq(timeslot.id, timeslotId), eq(timeslot.userId, instructorId)),
        )
        .limit(1);

      if (instructorAvailable.length === 0) {
        throw new Error(
          "El instructor seleccionado no está disponible para esta franja",
        );
      }
    }

    // Crear la reserva
    const newBooking = await db
      .insert(booking)
      .values({
        fieldId,
        userId,
        timeslotId,
        fieldTimeslotId: slot.fieldTimeslotId,
        instructorId: withInstructor && instructorId ? instructorId : null,
        basePriceSnapshot: slot.basePrice,
        surchargeSnapshot: slot.surchargePercent,
        instructorPriceSnapshot: instructorPrice.toString(),
        totalPrice: totalPrice.toString(),
        currency: slot.currency,
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
        price: booking.totalPrice,
        currency: booking.currency,
        withInstructor: booking.withInstructor,
        status: booking.status,
        createdAt: booking.createdAt,
      })
      .from(booking)
      .leftJoin(field, eq(booking.fieldId, field.id))
      .leftJoin(timeslot, eq(booking.timeslotId, timeslot.id))
      .where(and(eq(booking.userId, userId), eq(booking.status, "confirmed")))
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
      .where(and(eq(booking.id, bookingId), eq(booking.userId, userId)))
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
