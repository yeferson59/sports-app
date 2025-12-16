"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getInstructorScheduleWithBookings } from "./action";
import Image from "next/image";
import { InstructorHeader } from "@/components/instructor-header";

interface Schedule {
  timeslotId: string;
  dayOfWeek: string | null | undefined;
  startTime: Date | null | undefined;
  endTime: Date | null | undefined;
  surchargePercent: string | null | undefined;
  bookings: Array<{
    id: string;
    fieldId: string;
    field_name: string | null;
    field_type: "futbol-6" | "padel" | null;
    withInstructor: boolean;
    instructorId: string | null;
    status: string;
    basePriceSnapshot: string;
    surchargeSnapshot: string;
    instructorPriceSnapshot: string;
    totalPrice: string;
    currency: string;
    createdAt: Date;
  }>;
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

const formatTime = (date: Date | string | null | undefined): string => {
  if (!date) return "N/A";
  const d = new Date(date);
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export default function ObtenerHorariosInstructor() {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = async () => {
    try {
      const data = await getInstructorScheduleWithBookings();
      setSchedule(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los horarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <InstructorHeader>
          <Link href="/instructor">
            <Button variant="outline">← Volver</Button>
          </Link>
        </InstructorHeader>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">Cargando tus horarios...</p>
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <InstructorHeader>
        <Link href="/instructor">
          <Button variant="outline">← Volver</Button>
        </Link>
      </InstructorHeader>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold">Mis Horarios</h1>
          <p className="mt-2 text-slate-300 text-lg">Visualiza los horarios con reservas asignadas</p>
        </header>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Lista de horarios */}
        {schedule.length === 0 ? (
          <div className="bg-slate-800/40 rounded-2xl border border-white/10 p-12 text-center">
            <p className="text-xl text-slate-400">No tienes horarios con reservas</p>
            <p className="text-sm text-slate-500 mt-2">Cuando se asigne una reserva con instructor, aparecerá aquí</p>
          </div>
        ) : (
          <div className="space-y-6">
            {schedule.map((slot) => (
              <div
                key={slot.timeslotId}
                className="bg-slate-800/40 rounded-xl border border-white/10 shadow-xl backdrop-blur-sm overflow-hidden"
              >
                {/* Header del horario */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-b border-white/10 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-400">
                        {DAY_NAMES[(slot.dayOfWeek as string) || ""] || slot.dayOfWeek || "N/A"}
                      </h3>
                      <p className="text-slate-400 mt-1">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Reservas</p>
                      <p className="text-3xl font-bold text-cyan-400">{slot.bookings.length}</p>
                    </div>
                  </div>
                </div>

                {/* Reservas en este horario */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slot.bookings.map((b) => {
                      const statusInfo = STATUS_LABELS[b.status] || STATUS_LABELS.pending;

                      return (
                        <div
                          key={b.id}
                          className="bg-slate-700/50 rounded-lg border border-white/10 p-4 space-y-3"
                        >
                          <div>
                            <p className="text-sm text-slate-400">Cancha</p>
                            <p className="font-semibold text-white">{b.field_name || "N/A"}</p>
                            <p className="text-xs text-slate-500 capitalize">
                              {b.field_type?.replace("-", " ")}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/10">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="text-sm">
                            <p className="text-slate-400">Tu Pago:</p>
                            <p className="font-bold text-emerald-400">
                              ${Number(b.instructorPriceSnapshot).toFixed(2)} {b.currency}
                            </p>
                          </div>

                          <p className="text-xs text-slate-500 pt-2 border-t border-white/10">
                            Reservado: {new Date(b.createdAt).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
