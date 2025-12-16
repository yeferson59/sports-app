"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminHeader } from "@/components/admin-header";
import {
  getActiveFields,
  getAvailableTimeslots,
  getFieldTimeslots,
  assignTimeslotsToField,
  unassignTimeslotsFromField,
} from "./action";
import { Check, X, Clock } from "lucide-react";

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface Field {
  id: string;
  name: string;
  type: string;
}

interface Timeslot {
  id: string;
  fieldTimeslotId?: string;
  dayOfWeek: DayOfWeek;
  startTime: Date;
  endTime: Date;
  surchargePercent?: string;
  isActive: boolean;
  basePrice?: string | null;
  instructorPrice?: string | null;
}

const DAYS_OPTIONS: {
  value: DayOfWeek;
  label: string;
  short: string;
  index: number;
}[] = [
  { value: "monday", label: "Lunes", short: "Lu", index: 0 },
  { value: "tuesday", label: "Martes", short: "Ma", index: 1 },
  { value: "wednesday", label: "Miércoles", short: "Mi", index: 2 },
  { value: "thursday", label: "Jueves", short: "Ju", index: 3 },
  { value: "friday", label: "Viernes", short: "Vi", index: 4 },
  { value: "saturday", label: "Sábado", short: "Sa", index: 5 },
  { value: "sunday", label: "Domingo", short: "Do", index: 6 },
];

const getDayLabel = (day: DayOfWeek): string => {
  return DAYS_OPTIONS.find((d) => d.value === day)?.label ?? "";
};

const formatTime = (date: Date): string => {
  const d = new Date(date);
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")}`;
};

export default function RegistrarHorarioCancha() {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  const [availableTimeslots, setAvailableTimeslots] = useState<Timeslot[]>([]);
  const [fieldTimeslots, setFieldTimeslots] = useState<Timeslot[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [selectedTimeslotIds, setSelectedTimeslotIds] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState<string>("");
  const [instructorPrice, setInstructorPrice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"available" | "assigned">("available");

  useEffect(() => {
    async function loadData() {
      try {
        const activeFields = await getActiveFields();
        setFields(activeFields);

        if (activeFields.length > 0) {
          setSelectedFieldId(activeFields[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar datos");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadFieldData() {
      if (!selectedFieldId) return;

      try {
        const [availSlots, fieldSlots] = await Promise.all([
          getAvailableTimeslots(selectedFieldId),
          getFieldTimeslots(selectedFieldId),
        ]);

        setAvailableTimeslots(availSlots);
        setFieldTimeslots(fieldSlots);
      } catch (err: any) {
        console.error("Error loading field data:", err);
      }
    }

    loadFieldData();
  }, [selectedFieldId]);

  const getTimeslotsForDay = (slots: Timeslot[], day: DayOfWeek) => {
    return slots
      .filter((s) => s.dayOfWeek === day)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  };

  const toggleTimeslotSelection = (timeslotId: string) => {
    setSelectedTimeslotIds((prev) =>
      prev.includes(timeslotId)
        ? prev.filter((id) => id !== timeslotId)
        : [...prev, timeslotId],
    );
  };

  const handleAssignTimeslots = async () => {
    if (selectedTimeslotIds.length === 0) {
      setError("Debes seleccionar al menos una franja horaria");
      return;
    }

    if (!selectedFieldId) {
      setError("Debes seleccionar una cancha");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await assignTimeslotsToField({
        timeslot_ids: selectedTimeslotIds,
        field_id: selectedFieldId,
        base_price: basePrice || undefined,
        instructor_price: instructorPrice || undefined,
      });

      setMessage(result.message);
      setSelectedTimeslotIds([]);
      setBasePrice("");
      setInstructorPrice("");

      // Recargar datos
      const [availSlots, fieldSlots] = await Promise.all([
        getAvailableTimeslots(selectedFieldId),
        getFieldTimeslots(selectedFieldId),
      ]);

      setAvailableTimeslots(availSlots);
      setFieldTimeslots(fieldSlots);

      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Error al asignar horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignTimeslots = async () => {
    if (selectedTimeslotIds.length === 0) {
      setError("Debes seleccionar al menos una franja horaria");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await unassignTimeslotsFromField(
        selectedFieldId,
        selectedTimeslotIds,
      );

      setMessage(result.message);
      setSelectedTimeslotIds([]);

      // Recargar datos
      const [availSlots, fieldSlots] = await Promise.all([
        getAvailableTimeslots(selectedFieldId),
        getFieldTimeslots(selectedFieldId),
      ]);

      setAvailableTimeslots(availSlots);
      setFieldTimeslots(fieldSlots);

      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Error al liberar horarios");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Cargando datos...</p>
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <AdminHeader title="Asignar Horarios a Canchas" />
        <div className="mt-10 text-center">
          <p className="text-xl text-slate-400">
            No hay canchas disponibles. Por favor, registra canchas primero.
          </p>
        </div>
      </div>
    );
  }

  const currentDayTimeslots =
    view === "available"
      ? getTimeslotsForDay(availableTimeslots, selectedDay)
      : getTimeslotsForDay(fieldTimeslots, selectedDay);

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <AdminHeader title="Asignar Horarios a Canchas" />

      {message && (
        <Alert variant="success" className="mt-6 max-w-5xl mx-auto">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-6 max-w-5xl mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selector de cancha */}
      <div className="mt-8 max-w-5xl mx-auto">
        <Label htmlFor="field-select">Selecciona una cancha</Label>
        <Select
          id="field-select"
          value={selectedFieldId}
          onChange={(e) => {
            setSelectedFieldId(e.target.value);
            setSelectedTimeslotIds([]);
          }}
          className="mt-2"
        >
          {fields.map((field) => (
            <option key={field.id} value={field.id}>
              {field.name} ({field.type})
            </option>
          ))}
        </Select>
      </div>

      {/* Tabs: Franjas disponibles vs Franjas asignadas */}
      <div className="mt-8 max-w-5xl mx-auto">
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => {
              setView("available");
              setSelectedTimeslotIds([]);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              view === "available"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📋 Franjas Disponibles ({availableTimeslots.length})
          </button>
          <button
            onClick={() => {
              setView("assigned");
              setSelectedTimeslotIds([]);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              view === "assigned"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ✅ Franjas de {selectedField?.name} ({fieldTimeslots.length})
          </button>
        </div>
      </div>

      {/* Selector de día */}
      <div className="mt-6 max-w-5xl mx-auto">
        <Label>Selecciona el día</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {DAYS_OPTIONS.map((day) => {
            const daySlots =
              view === "available"
                ? getTimeslotsForDay(availableTimeslots, day.value)
                : getTimeslotsForDay(fieldTimeslots, day.value);

            return (
              <button
                key={day.value}
                onClick={() => {
                  setSelectedDay(day.value);
                  setSelectedTimeslotIds([]);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDay === day.value
                    ? "bg-emerald-500 text-white"
                    : daySlots.length > 0
                      ? "bg-slate-800 text-white hover:bg-slate-700"
                      : "bg-slate-800/30 text-slate-500 cursor-not-allowed"
                }`}
                disabled={daySlots.length === 0}
              >
                {day.short}
                <span className="ml-1 text-xs">({daySlots.length})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de franjas horarias del día seleccionado */}
      <div className="mt-6 max-w-5xl mx-auto">
        <div className="bg-slate-800/40 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {getDayLabel(selectedDay)} -{" "}
            {view === "available"
              ? "Franjas Disponibles"
              : `Franjas de ${selectedField?.name}`}
          </h3>

          {currentDayTimeslots.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              {view === "available"
                ? "No hay franjas horarias disponibles para este día"
                : "Esta cancha no tiene franjas asignadas para este día"}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {currentDayTimeslots.map((slot) => {
                const isSelected = selectedTimeslotIds.includes(slot.id);
                return (
                  <button
                    key={slot.id}
                    onClick={() => toggleTimeslotSelection(slot.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/20"
                        : "border-white/10 bg-slate-700/50 hover:border-white/30"
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {formatTime(slot.startTime)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatTime(slot.endTime)}
                    </div>
                    {!slot.isActive && (
                      <div className="text-xs text-orange-400 mt-1">
                        Inactiva
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Botones de acción */}
          {currentDayTimeslots.length > 0 && (
            <div className="mt-6 space-y-4">
              {view === "available" && selectedTimeslotIds.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="base-price-input">
                      Precio Base (Opcional)
                    </Label>
                    <Input
                      id="base-price-input"
                      type="number"
                      placeholder="Ej: 100000"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="mt-0"
                    />
                    <p className="text-xs text-slate-400">
                      Por defecto: Fútbol 6 = $100,000 | Pádel = $120,000
                    </p>
                  </div>

                  {selectedField?.type === "padel" && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="instructor-price-input">
                        Precio Instructor (Opcional - Solo Pádel)
                      </Label>
                      <Input
                        id="instructor-price-input"
                        type="number"
                        placeholder="Ej: 50000"
                        value={instructorPrice}
                        onChange={(e) => setInstructorPrice(e.target.value)}
                        className="mt-0"
                      />
                      <p className="text-xs text-slate-400">
                        Por defecto: $50,000 COP
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-amber-400 bg-amber-500/10 p-2 rounded">
                    💡 Las franjas después de las 5 PM tienen un sobrecargo del
                    2% automático
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end items-center">
                {selectedTimeslotIds.length > 0 && (
                  <div className="text-sm text-slate-300 flex items-center">
                    {selectedTimeslotIds.length} franja(s) seleccionada(s)
                  </div>
                )}
                {view === "available" ? (
                  <Button
                    onClick={handleAssignTimeslots}
                    disabled={loading || selectedTimeslotIds.length === 0}
                  >
                    {loading
                      ? "Asignando..."
                      : `Asignar a ${selectedField?.name}`}
                  </Button>
                ) : (
                  <Button
                    onClick={handleUnassignTimeslots}
                    disabled={loading || selectedTimeslotIds.length === 0}
                    variant="destructive"
                  >
                    {loading ? "Liberando..." : "Liberar Franjas"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
