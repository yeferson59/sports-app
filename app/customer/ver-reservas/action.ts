"use server";

import { db } from "@/db";
import { booking, field, user, timeslot } from "@/auth-schema";
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
      field_id: booking.field_id,
      field_name: field.name,
      field_type: field.type,
      with_instructor: booking.with_instructor,
      instructor_id: booking.instructor_id,
      instructor_name: user.name,
      timeslot_id: booking.timeslot_id,
      day_of_week: timeslot.day_of_week,
      start_time: timeslot.start_time,
      end_time: timeslot.end_time,
      base_price_snapshot: booking.base_price_snapshot,
      surcharge_snapshot: booking.surcharge_snapshot,
      instructor_price_snapshot: booking.instructor_price_snapshot,
      total_price: booking.total_price,
      currency: booking.currency,
      status: booking.status,
      created_at: booking.created_at,
    })
    .from(booking)
    .leftJoin(field, eq(booking.field_id, field.id))
    .leftJoin(user, eq(booking.instructor_id, user.id))
    .leftJoin(timeslot, eq(booking.timeslot_id, timeslot.id))
    .where(eq(booking.user_id, userId))
    .orderBy(desc(booking.created_at));

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

  if (existingBooking[0].user_id !== userId) {
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
      updated_at: new Date(),
    })
    .where(eq(booking.id, bookingId))
    .returning();

  return {
    success: true,
    booking: cancelledBooking[0],
    message: "Reserva cancelada correctamente",
  };
}