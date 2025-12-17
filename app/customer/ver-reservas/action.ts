"use server";

import { db } from "@/db";
import { booking, field, timeslot } from "@/app-schema";
import { user } from "@/auth-schema";
import { eq, desc } from "drizzle-orm";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";

// Obtener las reservas del usuario autenticado
export async function getUserBookings() {
  // Obtener usuario autenticado
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session?.data?.user) {
    throw new Error("No estás autenticado");
  }

  const userId = session.data.user.id;

  // Obtener reservas con información relacionada
  const userBookings = await db
    .select({
      id: booking.id,
      fieldId: booking.fieldId,
      field_name: field.name,
      field_type: field.typeField,
      withInstructor: booking.withInstructor,
      instructorId: booking.instructorId,
      instructor_name: user.name,
      timeslotId: booking.timeslotId,
      day_of_week: timeslot.dayOfWeek,
      start_time: timeslot.startTime,
      end_time: timeslot.endTime,
      basePriceSnapshot: booking.basePriceSnapshot,
      surchargeSnapshot: booking.surchargeSnapshot,
      instructorPriceSnapshot: booking.instructorPriceSnapshot,
      totalPrice: booking.totalPrice,
      currency: booking.currency,
      status: booking.status,
      createdAt: booking.createdAt,
    })
    .from(booking)
    .innerJoin(field, eq(booking.fieldId, field.id))
    .leftJoin(user, eq(booking.instructorId, user.id))
    .leftJoin(timeslot, eq(booking.timeslotId, timeslot.id))
    .where(eq(booking.userId, userId))
    .orderBy(desc(booking.createdAt))

  return userBookings;
}

// Cancelar una reserva
export async function cancelBooking(bookingId: string) {
  // Obtener usuario autenticado
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session?.data?.user) {
    throw new Error("No estás autenticado");
  }

  const userId = session.data.user.id;

  // Verificar que la reserva existe y pertenece al usuario
  const existingBooking = await db
    .select()
    .from(booking)
    .where(eq(booking.id, bookingId))
    .limit(1);

  if (existingBooking.length === 0) {
    throw new Error("La reserva no existe");
  }

  if (existingBooking[0].userId !== userId) {
    throw new Error("No tienes permiso para cancelar esta reserva");
  }

  if (existingBooking[0].status === "cancelled") {
    throw new Error("La reserva ya está cancelada");
  }

  // Cancelar la reserva
  const cancelledBooking = await db
    .update(booking)
    .set({
      status: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(booking.id, bookingId))
    .returning();

  return {
    success: true,
    booking: cancelledBooking[0],
    message: "Reserva cancelada correctamente",
  };
}