"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminHeader } from "@/components/admin-header";
import { saveTimeSlots } from "./action";
import { getActiveFields } from "./action";

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface Field {
  id: string;
  name: string;
  type: string;
}

interface TimeSlot {
  start: string;
  end: string;
  day: DayOfWeek;
  active: boolean;
}

const cardClass = `
  bg-slate-800/40
  rounded-xl
  border border-white/10
  shadow-xl
  backdrop-blur-sm
  p-6
  flex flex-col
  items-center
  gap-4
`;

const DAYS_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

export default function RegistrarHorarioCancha() {
  const [fields, setFields] = useState<Field[]>([]);
  const [horarios, setHorarios] = useState<Record<string, TimeSlot>>({});
  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFields() {
      try {
        const activeFields = await getActiveFields();
        setFields(activeFields);
        
        const initialHorarios: Record<string, TimeSlot> = {};
        activeFields.forEach((field) => {
          initialHorarios[field.id] = { 
            start: "", 
            end: "", 
            day: "monday",
            active: true 
          };
        });
        setHorarios(initialHorarios);
      } catch (err: any) {
        setError(err.message || "Error al cargar las canchas");
      } finally {
        setLoadingFields(false);
      }
    }

    loadFields();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const timeSlotsToSave = Object.entries(horarios)
        .filter(([_, slot]) => slot.start && slot.end)
        .map(([fieldId, slot]) => ({
          field_id: fieldId,
          start_time: slot.start,
          end_time: slot.end,
          day_of_week: slot.day,
          is_active: slot.active,
        }));

      if (timeSlotsToSave.length === 0) {
        setError("Debes agregar al menos un horario");
        setLoading(false);
        return;
      }

      const result = await saveTimeSlots(timeSlotsToSave);
      setMessage(result.message);

      const clearedHorarios: Record<string, TimeSlot> = {};
      fields.forEach((field) => {
        clearedHorarios[field.id] = { 
          start: "", 
          end: "", 
          day: "monday",
          active: true 
        };
      });
      setHorarios(clearedHorarios);
    } catch (err: any) {
      setError(err.message || "Error al guardar horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    fieldId: string, 
    field: "start" | "end" | "day" | "active", 
    value: string | boolean
  ) => {
    setHorarios((prev) => ({
      ...prev,
      [fieldId]: { 
        ...prev[fieldId], 
        [field]: value 
      },
    }));
  };

  if (loadingFields) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <p className="text-xl">Cargando canchas...</p>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <AdminHeader title="Registrar Horarios de Canchas" />
        <div className="mt-10 text-center">
          <p className="text-xl text-slate-400">
            No hay canchas disponibles. Por favor, registra canchas primero.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <AdminHeader title="Registrar Horarios de Canchas" />

      {message && (
        <div className="mt-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50">
          <p className="text-green-400">{message}</p>
        </div>
      )}
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-10">
        {fields.map((field, index) => (
          <div key={field.id} className={cardClass}>
            <h2 className="text-xl font-semibold mb-4">{field.name}</h2>
            <Image
              src={`/cancha${(index % 4) + 1}.png`}
              width={260}
              height={160}
              alt={field.name}
              className="rounded-lg w-full object-cover"
            />

            {/* Día de la semana */}
            <div className="w-full flex flex-col gap-2">
              <Label htmlFor={`day-${field.id}`} required>
                Día de la semana
              </Label>
              <select
                id={`day-${field.id}`}
                value={horarios[field.id]?.day || "monday"}
                onChange={(e) =>
                  handleChange(field.id, "day", e.target.value)
                }
                className="mt-2 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                {DAYS_OPTIONS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hora inicio */}
            <div className="w-full flex flex-col gap-2">
              <Label htmlFor={`start-${field.id}`} required>
                Hora inicio
              </Label>
              <Input
                id={`start-${field.id}`}
                type="time"
                value={horarios[field.id]?.start || ""}
                onChange={(e) =>
                  handleChange(field.id, "start", e.target.value)
                }
                className="mt-2"
              />
            </div>

            {/* Hora fin */}
            <div className="w-full flex flex-col gap-2">
              <Label htmlFor={`end-${field.id}`} required>
                Hora fin
              </Label>
              <Input
                id={`end-${field.id}`}
                type="time"
                value={horarios[field.id]?.end || ""}
                onChange={(e) =>
                  handleChange(field.id, "end", e.target.value)
                }
                className="mt-2"
              />
            </div>

            {/* Estado activo */}
            <div className="w-full flex items-center gap-3">
              <input
                id={`active-${field.id}`}
                type="checkbox"
                checked={horarios[field.id]?.active ?? true}
                onChange={(e) =>
                  handleChange(field.id, "active", e.target.checked)
                }
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-400 focus:ring-2 focus:ring-cyan-400"
              />
              <Label htmlFor={`active-${field.id}`} className="cursor-pointer">
                Horario activo
              </Label>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-12 flex justify-center">
        <Button onClick={handleSave} size="lg" disabled={loading}>
          {loading ? "Guardando..." : "Guardar horarios"}
        </Button>
      </div>
    </div>
  );
}