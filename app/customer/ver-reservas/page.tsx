"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserBookings, cancelBooking } from "./action";
import Image from "next/image";
import { CustomerHeader } from "@/components/customer-header";

interface Booking {
  id: string;
  fieldId: string;
  field_name: string | null;
  field_type: "futbol-6" | "padel" | null;
  withInstructor: boolean;
  instructorId: string | null;
  instructor_name: string | null;
  timeslotId: string | null;
  day_of_week: string | null;
  start_time: Date | null;
  end_time: Date | null;
  basePriceSnapshot: string;
  surchargeSnapshot: string;
  instructorPriceSnapshot: string;
  totalPrice: string;
  currency: string;
  status: string;
  createdAt: Date;
}

const DAY_NAMES: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
  confirmed: { label: "Confirmada", color: "bg-green-500/20 text-green-400 border-green-500/50" },
  cancelled: { label: "Cancelada", color: "bg-red-500/20 text-red-400 border-red-500/50" },
  completed: { label: "Completada", color: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
};

const formatTime = (date: Date | null): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface GroupedBooking extends Booking {
  slots: Booking[];
}

const groupConsecutiveBookings = (bookings: Booking[]): GroupedBooking[] => {
  const sortedBookings = [...bookings].sort((a, b) => {
    const aTime = new Date(a.start_time || 0).getTime();
    const bTime = new Date(b.start_time || 0).getTime();
    return aTime - bTime;
  });

  const grouped: GroupedBooking[] = [];

  for (const booking of sortedBookings) {
    const lastGroup = grouped[grouped.length - 1];
    const bookingStart = new Date(booking.start_time || 0).getTime();
    const lastGroupEnd = lastGroup
      ? new Date(lastGroup.end_time || 0).getTime()
      : null;

    if (
      lastGroup &&
      lastGroup.fieldId === booking.fieldId &&
      lastGroup.day_of_week === booking.day_of_week &&
      lastGroupEnd === bookingStart
    ) {
      lastGroup.slots.push(booking);
      lastGroup.end_time = booking.end_time;
      lastGroup.totalPrice = (
        parseFloat(lastGroup.totalPrice) + parseFloat(booking.totalPrice)
      ).toString();
      lastGroup.surchargeSnapshot = (
        parseFloat(lastGroup.surchargeSnapshot) +
        parseFloat(booking.surchargeSnapshot)
      ).toString();
      lastGroup.instructorPriceSnapshot = (
        parseFloat(lastGroup.instructorPriceSnapshot) +
        parseFloat(booking.instructorPriceSnapshot)
      ).toString();
    } else {
      grouped.push({
        ...booking,
        slots: [booking],
      });
    }
  }

  return grouped;
};

export default function VerReservasPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (groupedBooking: GroupedBooking) => {
    const message = groupedBooking.slots.length > 1 
      ? `¿Estás seguro de que deseas cancelar estas ${groupedBooking.slots.length} franjas horarias?`
      : "¿Estás seguro de que deseas cancelar esta reserva?";
    
    if (!confirm(message)) {
      return;
    }

    setCancellingId(groupedBooking.id);
    setMessage(null);
    setError(null);

    try {
      for (const slot of groupedBooking.slots) {
        await cancelBooking(slot.id);
      }
      setMessage(`${groupedBooking.slots.length === 1 ? "Reserva" : `${groupedBooking.slots.length} franjas`} cancelada${groupedBooking.slots.length > 1 ? "s" : ""} correctamente`);
      await loadBookings();
    } catch (err: any) {
      setError(err.message || "Error al cancelar la reserva");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <CustomerHeader>
          <Link href="/customer">
            <Button variant="outline">← Volver</Button>
          </Link>
        </CustomerHeader>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">Cargando tus reservas...</p>
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <CustomerHeader>
        <Link href="/customer">
          <Button variant="outline">← Volver</Button>
        </Link>
      </CustomerHeader>

      <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold">Mis Reservas</h1>
        <p className="mt-2 text-slate-300 text-lg">Gestiona todas tus reservas de canchas</p>
      </header>

      {/* Mensajes */}
      {message && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50">
          <p className="text-green-400">{message}</p>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Lista de reservas */}
      {bookings.length === 0 ? (
        <div className="bg-slate-800/40 rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-xl text-slate-400">No tienes reservas registradas</p>
          <p className="text-sm text-slate-500 mt-2">Cuando hagas una reserva, aparecerá aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groupConsecutiveBookings(bookings).map((groupedBooking) => {
            const statusInfo = STATUS_LABELS[groupedBooking.status] || STATUS_LABELS.pending;
            const fieldImage = groupedBooking.field_type === "padel" ? "/cancha3.png" : "/cancha1.png";
            const isGrouped = groupedBooking.slots.length > 1;

            return (
              <div
                key={groupedBooking.id}
                className="bg-slate-800/40 rounded-xl border border-white/10 shadow-xl backdrop-blur-sm overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={fieldImage}
                    alt={groupedBooking.field_name || "Cancha"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{groupedBooking.field_name}</h3>
                    <p className="text-sm text-slate-400 capitalize">
                      {groupedBooking.field_type?.replace("-", " ")}
                    </p>
                    {isGrouped && (
                      <p className="text-xs text-emerald-400 mt-1">📦 {groupedBooking.slots.length} franjas agrupadas</p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Día:</span>
                      <span className="font-semibold">{DAY_NAMES[groupedBooking.day_of_week || ""] || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Horario:</span>
                      <span className="font-semibold">
                        {formatTime(groupedBooking.start_time)} - {formatTime(groupedBooking.end_time)}
                      </span>
                    </div>
                    {isGrouped && (
                      <div className="space-y-1 mt-2 p-2 bg-slate-900/50 rounded">
                        <p className="text-slate-400 text-xs">Franjas incluidas:</p>
                        {groupedBooking.slots.map((slot, idx) => (
                          <p key={`${slot.id}-${idx}`} className="text-xs text-slate-300">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </p>
                        ))}
                      </div>
                    )}
                    {groupedBooking.withInstructor && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Instructor:</span>
                        <span className="font-semibold">{groupedBooking.instructor_name || "N/A"}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-4 bg-slate-900/50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {isGrouped ? (
                        <>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Canchas ({groupedBooking.slots.length})</span>
                            <span className="font-semibold text-sm">
                              ${groupedBooking.slots.reduce((sum, s) => sum + parseFloat(s.basePriceSnapshot), 0).toFixed(2)}
                            </span>
                          </div>
                          {Number(groupedBooking.surchargeSnapshot) > 0 && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 uppercase tracking-wide">Recargos</span>
                              <span className="font-semibold text-sm text-orange-400">
                                ${Number(groupedBooking.surchargeSnapshot).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {groupedBooking.withInstructor && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 uppercase tracking-wide">Instructores</span>
                              <span className="font-semibold text-sm text-emerald-400">
                                ${Number(groupedBooking.instructorPriceSnapshot).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Cancha</span>
                            <span className="font-semibold text-sm">${Number(groupedBooking.basePriceSnapshot).toFixed(2)}</span>
                          </div>
                          {Number(groupedBooking.surchargeSnapshot) > 0 && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 uppercase tracking-wide">Recargo</span>
                              <span className="font-semibold text-sm text-orange-400">${Number(groupedBooking.surchargeSnapshot).toFixed(2)}</span>
                            </div>
                          )}
                          {groupedBooking.withInstructor && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 uppercase tracking-wide">Instructor</span>
                              <span className="font-semibold text-sm text-emerald-400">${Number(groupedBooking.instructorPriceSnapshot).toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex justify-between items-center border-t border-white/10 pt-3">
                      <span className="text-sm text-slate-300">Total:</span>
                      <span className="text-2xl font-bold text-cyan-400">
                        ${Number(groupedBooking.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {groupedBooking.status !== "cancelled" && groupedBooking.status !== "completed" && (
                    <Button
                      onClick={() => handleCancel(groupedBooking)}
                      disabled={cancellingId === groupedBooking.id}
                      className="w-full bg-red-500 hover:bg-red-600"
                    >
                      {cancellingId === groupedBooking.id ? "Cancelando..." : "Cancelar Reserva"}
                    </Button>
                  )}

                  <p className="text-xs text-slate-500 text-center">
                    Reservado el {new Date(groupedBooking.createdAt).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </main>
  );
}