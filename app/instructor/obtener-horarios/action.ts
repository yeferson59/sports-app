"use server";

import { db } from "@/db";
import { booking, field, timeslot } from "@/app-schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";

export async function getInstructorScheduleWithBookings() {
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    });

    if (!session?.data?.user?.id) {
      throw new Error("No estás autenticado");
    }

    const instructorId = session.data.user.id;

    // Obtener todos los bookings donde el instructor está asignado
    const bookingsWithSchedule = await db
      .select({
        id: booking.id,
        fieldId: booking.fieldId,
        field_name: field.name,
        field_type: field.typeField,
        withInstructor: booking.withInstructor,
        instructorId: booking.instructorId,
        timeslotId: booking.timeslotId,
        dayOfWeek: timeslot.dayOfWeek,
        startTime: timeslot.startTime,
        endTime: timeslot.endTime,
        surchargePercent: timeslot.surchargePercent,
        basePriceSnapshot: booking.basePriceSnapshot,
        surchargeSnapshot: booking.surchargeSnapshot,
        instructorPriceSnapshot: booking.instructorPriceSnapshot,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        status: booking.status,
        createdAt: booking.createdAt,
      })
      .from(booking)
      .leftJoin(field, eq(booking.fieldId, field.id))
      .leftJoin(timeslot, eq(booking.timeslotId, timeslot.id))
      .where(eq(booking.instructorId, instructorId))
      .orderBy(desc(booking.createdAt));

    // Agrupar por timeslot para mostrar la información
    const scheduleMap = new Map<
      string | null | undefined,
      {
        dayOfWeek: string | null | undefined;
        startTime: Date | null | undefined;
        endTime: Date | null | undefined;
        surchargePercent: string | null | undefined;
        bookings: typeof bookingsWithSchedule;
      }
    >();

    for (const b of bookingsWithSchedule) {
      if (!b.timeslotId) continue;

      const key = b.timeslotId;
      if (!scheduleMap.has(key)) {
        scheduleMap.set(key, {
          dayOfWeek: b.dayOfWeek,
          startTime: b.startTime,
          endTime: b.endTime,
          surchargePercent: b.surchargePercent?.toString(),
          bookings: [],
        });
      }

      const schedule = scheduleMap.get(key)!;
      schedule.bookings.push(b);
    }

    return Array.from(scheduleMap.values()).map((item, idx) => ({
      timeslotId: `slot-${idx}`,
      ...item,
    }));
  } catch (error: any) {
    throw new Error(error.message || "Error al cargar los horarios");
  }
}
