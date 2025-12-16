"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CustomerHeader } from "@/components/customer-header";
import { getActiveFields, getAvailableSlots, createBooking, getAvailableInstructorsForSlot } from "./action";
import { ChevronDown, ChevronUp, Calendar, Clock, Check } from "lucide-react";

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface Field {
  id: string;
  name: string;
  type: string;
}

interface TimeSlot {
  id: string;
  fieldTimeslotId: string;
  fieldId: string;
  dayOfWeek: DayOfWeek;
  startTime: Date;
  endTime: Date;
  surchargePercent: string;
  isActive: boolean;
  basePrice: string | null;
  instructorPrice: string | null;
  calculatedPrice: string;
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
  const d = new Date(date);
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
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
  const [selectedFieldType, setSelectedFieldType] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [withInstructor, setWithInstructor] = useState<boolean>(false);
  const [availableInstructors, setAvailableInstructors] = useState<Array<{id: string, name: string | null, email: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [loadingFields, setLoadingFields] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedFields, setExpandedFields] = useState<FieldExpanded>({});
  const [bookingInProgress, setBookingInProgress] = useState(false);

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
          setSelectedFieldType(activeFields[0].type);
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

  const toggleSlotSelection = (timeslotId: string) => {
    setSelectedSlots(prev => 
      prev.includes(timeslotId)
        ? prev.filter(id => id !== timeslotId)
        : [...prev, timeslotId]
    );
  };

  // Cargar instructores cuando se activa el checkbox de instructor
  useEffect(() => {
    async function loadInstructors() {
      if (!withInstructor || selectedSlots.length === 0 || selectedFieldType !== "padel") {
        setAvailableInstructors([]);
        return;
      }

      setLoadingInstructors(true);
      try {
        // Verificar si TODAS las franjas tienen el mismo instructor
        const instructorsBySlot = await Promise.all(
          selectedSlots.map(slotId => getAvailableInstructorsForSlot(slotId))
        );

        // Filtrar franjas que tienen instructor
        const slotsWithInstructor = instructorsBySlot.filter(instructors => instructors.length > 0);
        
        if (slotsWithInstructor.length === 0) {
          // Ninguna franja tiene instructor
          setAvailableInstructors([]);
        } else if (slotsWithInstructor.length === selectedSlots.length) {
          // Todas las franjas tienen instructor
          // Verificar si es el mismo instructor en todas
          const firstInstructor = slotsWithInstructor[0][0];
          const sameInstructor = slotsWithInstructor.every(
            instructors => instructors[0].id === firstInstructor.id
          );
          
          if (sameInstructor) {
            setAvailableInstructors([firstInstructor]);
          } else {
            // Diferentes instructores en diferentes franjas
            setAvailableInstructors([]);
          }
        } else {
          // Algunas franjas tienen instructor, otras no
          setAvailableInstructors([]);
        }
      } catch (err: any) {
        console.error("Error loading instructors:", err);
      } finally {
        setLoadingInstructors(false);
      }
    }

    loadInstructors();
  }, [withInstructor, selectedSlots, selectedFieldType]);

  const calculateTotal = () => {
    const selected = availableSlots.filter(slot => selectedSlots.includes(slot.id));
    let total = 0;
    
    selected.forEach(slot => {
      const slotPrice = parseFloat(slot.calculatedPrice);
      const instructorCost = withInstructor && selectedFieldType === "padel" 
        ? parseFloat(slot.instructorPrice || "0") 
        : 0;
      total += slotPrice + instructorCost;
    });
    
    return total;
  };

  const handleConfirmBooking = async () => {
    if (!session?.user?.id) {
      setError("Debes iniciar sesión para reservar");
      return;
    }

    if (selectedSlots.length === 0) {
      setError("Debes seleccionar al menos una franja horaria");
      return;
    }

    try {
      setBookingInProgress(true);
      setError(null);
      setMessage(null);

      // Validar que si se requiere instructor, haya instructor disponible
      if (withInstructor && availableInstructors.length === 0) {
        setError("No hay instructor disponible para las franjas seleccionadas");
        setBookingInProgress(false);
        return;
      }

      const instructorToUse = withInstructor ? (availableInstructors[0]?.id || "") : "";

      // Crear reservas para cada franja seleccionada
      for (const timeslotId of selectedSlots) {
        await createBooking(
          selectedField, 
          timeslotId, 
          session.user.id, 
          withInstructor,
          instructorToUse || undefined
        );
      }

      setMessage(`¡${selectedSlots.length} reserva(s) confirmada(s)! Puedes verlas en 'Mis Reservas'`);

      // Limpiar selección y recargar
      setSelectedSlots([]);
      setWithInstructor(false);
      setAvailableInstructors([]);
      const slots = await getAvailableSlots(selectedField, selectedDay);
      setAvailableSlots(slots as TimeSlot[]);

      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Error al crear las reservas");
    } finally {
      setBookingInProgress(false);
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
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <CustomerHeader>
        <Link href="/customer">
          <Button variant="outline">← Volver</Button>
        </Link>
      </CustomerHeader>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Apartar Cancha</h1>
          <p className="text-slate-300">Selecciona una cancha, elige un día y reserva tu horario</p>
        </header>

        {/* Mensajes */}
        {message && (
          <Alert variant="success" className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
              const field = fields.find(f => f.id === e.target.value);
              setSelectedField(e.target.value);
              setSelectedFieldType(field?.type || "");
              setSelectedDay("monday");
              setWithInstructor(false);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlots.includes(slot.id);
                return (
                  <button
                    key={slot.id}
                    onClick={() => toggleSlotSelection(slot.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-white/10 bg-slate-800/40 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-emerald-400">
                        {formatTime(new Date(slot.startTime))}
                      </div>
                      {parseFloat(slot.surchargePercent) > 0 && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                          +{slot.surchargePercent}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      {formatTime(new Date(slot.endTime))}
                    </div>
                    <div className="text-sm text-slate-300 font-semibold">
                      {formatPrice(slot.calculatedPrice)}
                    </div>
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-emerald-500/30">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumen y Confirmación */}
        {selectedSlots.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-lg border border-emerald-500/50 shadow-2xl sticky bottom-8 z-50">
            <h3 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Resumen de Reserva
            </h3>

            {/* Franjas seleccionadas */}
            <div className="mb-4 space-y-2">
              <p className="text-sm text-slate-400 font-semibold">
                Franjas seleccionadas ({selectedSlots.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSlots
                  .filter(slot => selectedSlots.includes(slot.id))
                  .map(slot => (
                    <span
                      key={slot.id}
                      className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm"
                    >
                      {formatTime(new Date(slot.startTime))} - {formatTime(new Date(slot.endTime))}
                    </span>
                  ))}
              </div>
            </div>

            {/* Opción de instructor (solo pádel) */}
            {selectedFieldType === "padel" && (
              <div className="mb-4 p-4 bg-slate-700/50 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="global-instructor"
                    checked={withInstructor}
                    onChange={(e) => setWithInstructor(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="global-instructor" className="text-sm text-slate-300 cursor-pointer font-semibold">
                    Agregar instructor a todas las franjas
                  </label>
                </div>
                
                {withInstructor && (
                  <>
                    {loadingInstructors ? (
                      <p className="text-xs text-slate-400">Verificando disponibilidad de instructores...</p>
                    ) : availableInstructors.length === 0 ? (
                      <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                        <p className="text-xs text-orange-400 mb-1 font-semibold">
                          ⚠️ No hay instructor disponible
                        </p>
                        <p className="text-xs text-slate-400">
                          Las franjas seleccionadas no tienen el mismo instructor asignado o algunas no tienen instructor. 
                          Por favor, selecciona franjas con el mismo instructor.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded">
                          <p className="text-xs text-emerald-400 font-semibold mb-1">
                            ✓ Instructor disponible
                          </p>
                          <p className="text-sm text-white font-medium">
                            {availableInstructors[0].name || availableInstructors[0].email}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Costo: {formatPrice(availableSlots[0]?.instructorPrice || "0")} × {selectedSlots.length} franjas
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Total */}
            <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Total a pagar:</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {formatPrice(calculateTotal().toString())}
                </span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setSelectedSlots([]);
                  setWithInstructor(false);
                }}
                variant="outline"
                className="flex-1"
                disabled={bookingInProgress}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="flex-1"
                disabled={bookingInProgress}
              >
                {bookingInProgress ? "Procesando..." : "Confirmar Reserva"}
              </Button>
            </div>
          </div>
        )}

        {/* Info */}
        {selectedSlots.length === 0 && (
          <div className="bg-slate-800/50 p-4 rounded-lg border border-emerald-500/30">
            <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Cómo reservar
            </h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>✓ Selecciona la cancha que deseas</li>
              <li>✓ Elige el día de tu preferencia</li>
              <li>✓ Haz clic en las franjas horarias que quieres reservar</li>
              <li>✓ Revisa el resumen y confirma tu reserva</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
