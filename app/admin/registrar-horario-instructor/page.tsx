"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AdminHeader } from "@/components/admin-header";
import {
  getInstructors,
  getAvailableTimeslotsForInstructor,
  getInstructorTimeslots,
  assignTimeslotsToInstructor,
  unassignTimeslotsFromInstructor,
} from "./action";
import { Check, X, Clock, User } from "lucide-react";

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface Instructor {
  id: string;
  name: string | null;
  email: string;
}

interface Timeslot {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: Date;
  endTime: Date;
  surchargePercent: string;
  isActive: boolean;
}

const DAYS_OPTIONS: { value: DayOfWeek; label: string; short: string }[] = [
  { value: "monday", label: "Lunes", short: "Lu" },
  { value: "tuesday", label: "Martes", short: "Ma" },
  { value: "wednesday", label: "Miércoles", short: "Mi" },
  { value: "thursday", label: "Jueves", short: "Ju" },
  { value: "friday", label: "Viernes", short: "Vi" },
  { value: "saturday", label: "Sábado", short: "Sa" },
  { value: "sunday", label: "Domingo", short: "Do" },
];

const getDayLabel = (day: DayOfWeek): string => {
  return DAYS_OPTIONS.find((d) => d.value === day)?.label ?? "";
};

const formatTime = (date: Date): string => {
  const d = new Date(date);
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`;
};

export default function RegistrarHorarioInstructor() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");
  const [availableTimeslots, setAvailableTimeslots] = useState<Timeslot[]>([]);
  const [instructorTimeslots, setInstructorTimeslots] = useState<Timeslot[]>(
    []
  );
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [selectedTimeslotIds, setSelectedTimeslotIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"available" | "assigned">("available");

  useEffect(() => {
    async function loadData() {
      try {
        const instructorsList = await getInstructors();
        setInstructors(instructorsList);

        if (instructorsList.length > 0) {
          setSelectedInstructorId(instructorsList[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar instructores");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadInstructorData() {
      if (!selectedInstructorId) return;

      try {
        const [availSlots, instrSlots] = await Promise.all([
          getAvailableTimeslotsForInstructor(selectedInstructorId),
          getInstructorTimeslots(selectedInstructorId),
        ]);

        setAvailableTimeslots(availSlots);
        setInstructorTimeslots(instrSlots);
      } catch (err: any) {
        console.error("Error loading instructor data:", err);
      }
    }

    loadInstructorData();
  }, [selectedInstructorId]);

  const getTimeslotsForDay = (slots: Timeslot[], day: DayOfWeek) => {
    return slots
      .filter((s) => s.dayOfWeek === day)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  };

  const toggleTimeslotSelection = (timeslotId: string) => {
    setSelectedTimeslotIds((prev) =>
      prev.includes(timeslotId)
        ? prev.filter((id) => id !== timeslotId)
        : [...prev, timeslotId]
    );
  };

  const handleAssignTimeslots = async () => {
    if (selectedTimeslotIds.length === 0) {
      setError("Debes seleccionar al menos una franja horaria");
      return;
    }

    if (!selectedInstructorId) {
      setError("Debes seleccionar un instructor");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await assignTimeslotsToInstructor({
        timeslot_ids: selectedTimeslotIds,
        instructor_id: selectedInstructorId,
      });

      setMessage(result.message);
      setSelectedTimeslotIds([]);

      // Recargar datos
      const [availSlots, instrSlots] = await Promise.all([
        getAvailableTimeslotsForInstructor(selectedInstructorId),
        getInstructorTimeslots(selectedInstructorId),
      ]);

      setAvailableTimeslots(availSlots);
      setInstructorTimeslots(instrSlots);

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
      const result = await unassignTimeslotsFromInstructor(
        selectedInstructorId,
        selectedTimeslotIds
      );

      setMessage(result.message);
      setSelectedTimeslotIds([]);

      // Recargar datos
      const [availSlots, instrSlots] = await Promise.all([
        getAvailableTimeslotsForInstructor(selectedInstructorId),
        getInstructorTimeslots(selectedInstructorId),
      ]);

      setAvailableTimeslots(availSlots);
      setInstructorTimeslots(instrSlots);

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
          <p className="text-xl mb-4">Cargando instructores...</p>
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (instructors.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <AdminHeader title="Asignar Horarios a Instructores" />
        <div className="mt-10 text-center">
          <p className="text-xl text-slate-400">
            No hay instructores registrados. Por favor, registra instructores primero.
          </p>
        </div>
      </div>
    );
  }

  const currentDayTimeslots =
    view === "available"
      ? getTimeslotsForDay(availableTimeslots, selectedDay)
      : getTimeslotsForDay(instructorTimeslots, selectedDay);

  const selectedInstructor = instructors.find(
    (i) => i.id === selectedInstructorId
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <AdminHeader title="Asignar Horarios a Instructores" />

      {message && (
        <div className="mt-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-start gap-3 max-w-5xl mx-auto">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-400">{message}</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 rounded-lg bg-destructive/20 border border-destructive/50 flex items-start gap-3 max-w-5xl mx-auto">
          <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Selector de instructor */}
      <div className="mt-8 max-w-5xl mx-auto">
        <Label htmlFor="instructor-select">Selecciona un Instructor</Label>
        <Select
          id="instructor-select"
          value={selectedInstructorId}
          onChange={(e) => {
            setSelectedInstructorId(e.target.value);
            setSelectedTimeslotIds([]);
          }}
          className="mt-2"
        >
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.name || instructor.email}
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
            ✅ Horarios de {selectedInstructor?.name} (
            {instructorTimeslots.length})
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
                : getTimeslotsForDay(instructorTimeslots, day.value);

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
              : `Horarios de ${selectedInstructor?.name}`}
          </h3>

          {currentDayTimeslots.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              {view === "available"
                ? "No hay franjas horarias disponibles para este día"
                : "Este instructor no tiene franjas asignadas para este día"}
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
                  </button>
                );
              })}
            </div>
          )}

          {/* Botones de acción */}
          {currentDayTimeslots.length > 0 && (
            <div className="mt-6 flex gap-3 justify-end">
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
                    : `Asignar a ${selectedInstructor?.name}`}
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
          )}
        </div>
      </div>
    </div>
  );
}
