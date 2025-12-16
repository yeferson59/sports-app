"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getUserBookings, cancelBooking } from "./action";
import Image from "next/image";

interface Booking {
  id: string;
  field_id: string;
  field_name: string | null;
  field_type: string | null;
  with_instructor: boolean;
  instructor_id: string | null;
  instructor_name: string | null;
  timeslot_id: string | null;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  base_price_snapshot: string; // numeric se devuelve como string
  surcharge_snapshot: string; // numeric se devuelve como string
  instructor_price_snapshot: string; // numeric se devuelve como string
  total_price: string; // numeric se devuelve como string
  currency: string;
  status: string;
  created_at: Date;
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

  const handleCancel = async (bookingId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      return;
    }

    setCancellingId(bookingId);
    setMessage(null);
    setError(null);

    try {
      const result = await cancelBooking(bookingId);
      setMessage(result.message);
      await loadBookings();
    } catch (err: any) {
      setError(err.message || "Error al cancelar la reserva");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <p className="text-xl">Cargando tus reservas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* Header */}
      <div className="bg-slate-800/40 rounded-2xl border border-white/10 p-6 shadow-xl backdrop-blur-sm mb-8">
        <h1 className="text-3xl font-bold">Mis Reservas</h1>
        <p className="text-slate-300 mt-2">Gestiona todas tus reservas de canchas</p>
      </div>

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
          {bookings.map((booking) => {
            const statusInfo = STATUS_LABELS[booking.status] || STATUS_LABELS.pending;
            const fieldImage = booking.field_type === "padel" ? "/cancha3.png" : "/cancha1.png";

            return (
              <div
                key={booking.id}
                className="bg-slate-800/40 rounded-xl border border-white/10 shadow-xl backdrop-blur-sm overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={fieldImage}
                    alt={booking.field_name || "Cancha"}
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
                    <h3 className="text-2xl font-bold">{booking.field_name}</h3>
                    <p className="text-sm text-slate-400 capitalize">{booking.field_type}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Día:</span>
                      <span className="font-semibold">{DAY_NAMES[booking.day_of_week || ""] || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Horario:</span>
                      <span className="font-semibold">
                        {booking.start_time} - {booking.end_time}
                      </span>
                    </div>
                    {booking.with_instructor && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Instructor:</span>
                        <span className="font-semibold">{booking.instructor_name || "N/A"}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Precio base:</span>
                      <span>${Number(booking.base_price_snapshot).toFixed(2)}</span>
                    </div>
                    {Number(booking.surcharge_snapshot) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Recargo:</span>
                        <span>${Number(booking.surcharge_snapshot).toFixed(2)}</span>
                      </div>
                    )}
                    {booking.with_instructor && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Instructor:</span>
                        <span>${Number(booking.instructor_price_snapshot).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2">
                      <span>Total:</span>
                      <span className="text-cyan-400">
                        ${Number(booking.total_price).toFixed(2)} {booking.currency}
                      </span>
                    </div>
                  </div>

                  {booking.status !== "cancelled" && booking.status !== "completed" && (
                    <Button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="w-full bg-red-500 hover:bg-red-600"
                    >
                      {cancellingId === booking.id ? "Cancelando..." : "Cancelar Reserva"}
                    </Button>
                  )}

                  <p className="text-xs text-slate-500 text-center">
                    Reservado el {new Date(booking.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}