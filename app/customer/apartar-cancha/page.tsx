"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getActiveFields, getAvailableSlots, createBooking } from "./action";
import { ChevronDown, ChevronUp, Check, X, Calendar, Clock } from "lucide-react";

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface Field {
  id: string;
  name: string;
  type: string;
}

interface TimeSlot {
  id: string;
  fieldId: string;
  dayOfWeek: DayOfWeek;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  priceAmount: string | null;
}

interface FieldExpanded {
  [key: string]: boolean;
}

const DAYS_OPTIONS: { value: DayOfWeek; label: string; short: string; index: number }[] = [
  { value: "monday", label: "Lunes", short: "Lu", index: 0 },
  { value: "tuesday", label: "Martes", short: "Ma", index: 1 },
  { value: "wednesday", label: "Miércoles", short: "Mi", index: 2 },
  { value: "thursday", label: "Jueves", short: "Ju", index: 3 },
  { value: "friday", label: "Viernes", short: "Vi", index: 4 },
  { value: "saturday", label: "Sábado", short: "Sa", index: 5 },
  { value: "sunday", label: "Domingo", short: "Do", index: 6 },
];

const getDayLabel = (day: DayOfWeek): string => {
  return DAYS_OPTIONS.find(d => d.value === day)?.label ?? "";
};

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatPrice = (price: string | null): string => {
  if (!price) return "No disponible";
  const numPrice = parseFloat(price);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(numPrice);
};

export default function ApartarCancha() {
  const { data: session } = authClient.useSession();
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedFields, setExpandedFields] = useState<FieldExpanded>({});
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);

  // Verificar autenticación
  useEffect(() => {
    if (!session?.user) {
      setError("Debes iniciar sesión para reservar");
    }
  }, [session]);

  // Cargar canchas
  useEffect(() => {
    async function loadFields() {
      try {
        const activeFields = await getActiveFields();
        setFields(activeFields);
        
        if (activeFields.length > 0) {
          setSelectedField(activeFields[0].id);
          const expandedState: FieldExpanded = {};
          expandedState[activeFields[0].id] = true;
          setExpandedFields(expandedState);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar las canchas");
      } finally {
        setLoadingFields(false);
      }
    }

    loadFields();
  }, []);

  // Cargar slots cuando cambia cancha o día
  useEffect(() => {
    if (!selectedField) return;

    async function loadSlots() {
      try {
        setLoading(true);
        const slots = await getAvailableSlots(selectedField, selectedDay);
        setAvailableSlots(slots as TimeSlot[]);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error al cargar disponibilidad");
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    }

    loadSlots();
  }, [selectedField, selectedDay]);

  const handleBooking = async (timeslotId: string) => {
    if (!session?.user?.id) {
      setError("Debes iniciar sesión para reservar");
      return;
    }

    try {
      setBookingInProgress(timeslotId);
      setError(null);
      setMessage(null);

      await createBooking(selectedField, timeslotId, session.user.id, false);
      setMessage("¡Reserva confirmada! Puedes verla en 'Mis Reservas'");

      // Recargar slots
      const slots = await getAvailableSlots(selectedField, selectedDay);
      setAvailableSlots(slots as TimeSlot[]);

      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Error al crear la reserva");
    } finally {
      setBookingInProgress(null);
    }
  };

  const toggleFieldExpanded = (fieldId: string) => {
    setExpandedFields(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  if (loadingFields) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Cargando canchas...</p>
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-400">No hay canchas disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  const currentField = fields.find(f => f.id === selectedField);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Apartar Cancha</h1>
          <p className="text-slate-300">Selecciona una cancha, elige un día y reserva tu horario</p>
        </header>

        {/* Mensajes */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-400">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/20 border border-destructive/50 flex items-start gap-3">
            <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Seleccionar Cancha */}
        <div className="mb-8 bg-slate-800/40 p-6 rounded-lg border border-white/10">
          <Label htmlFor="field-select" className="text-lg font-semibold mb-3 block">
            Selecciona una Cancha
          </Label>
          <Select
            id="field-select"
            value={selectedField}
            onChange={(e) => {
              setSelectedField(e.target.value);
              setSelectedDay("monday");
            }}
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.type})
              </option>
            ))}
          </Select>
        </div>

        {/* Seleccionar Día */}
        <div className="mb-8 bg-slate-800/40 p-6 rounded-lg border border-white/10">
          <Label htmlFor="day-select" className="text-lg font-semibold mb-3 block">
            Selecciona un Día
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAYS_OPTIONS.map((day) => (
              <button
                key={day.value}
                onClick={() => setSelectedDay(day.value)}
                className={`p-3 rounded-lg border transition-all font-semibold ${
                  selectedDay === day.value
                    ? "bg-emerald-500/30 border-emerald-400 text-emerald-400"
                    : "bg-slate-700/30 border-white/10 text-slate-300 hover:border-white/30"
                }`}
              >
                <div className="text-xs">{day.short}</div>
                <div className="text-sm">{day.label.split(" ")[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Horarios disponibles */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            Horarios Disponibles
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-400">Cargando horarios...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 bg-slate-800/40 rounded-lg border border-white/10">
              <p className="text-slate-400">No hay horarios disponibles para este día</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-lg bg-slate-800/40 border border-white/10 hover:border-emerald-400/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-semibold text-emerald-400">
                      {formatTime(new Date(slot.startTime))} - {formatTime(new Date(slot.endTime))}
                    </div>
                  </div>

                  <div className="mb-4 pb-4 border-b border-white/10">
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold">{formatPrice(slot.priceAmount)}</span>
                    </p>
                  </div>

                  <Button
                    onClick={() => handleBooking(slot.id)}
                    disabled={bookingInProgress === slot.id}
                    size="sm"
                    className="w-full"
                  >
                    {bookingInProgress === slot.id ? "Reservando..." : "Reservar"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-emerald-500/30">
          <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Cómo reservar
          </h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>✓ Selecciona la cancha que deseas</li>
            <li>✓ Elige el día de tu preferencia</li>
            <li>✓ Selecciona el horario disponible</li>
            <li>✓ Confirma tu reserva</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
