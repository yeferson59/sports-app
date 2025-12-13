"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AdminHeader } from "@/components/admin-header";
import { saveTimeSlots } from "./action";
import { getActiveFields } from "./action";
import { ChevronDown, ChevronUp, Check, X, Calendar } from "lucide-react";

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface Field {
  id: string;
  name: string;
  type: string;
}

interface TimeSlotConfig {
  startDay: DayOfWeek;
  endDay: DayOfWeek;
  startTime: string;
  endTime: string;
  active: boolean;
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

const getDayIndex = (day: DayOfWeek): number => {
  return DAYS_OPTIONS.find(d => d.value === day)?.index ?? 0;
};

const getDayLabel = (day: DayOfWeek): string => {
  return DAYS_OPTIONS.find(d => d.value === day)?.label ?? "";
};

export default function RegistrarHorarioCancha() {
  const [fields, setFields] = useState<Field[]>([]);
  const [config, setConfig] = useState<Record<string, TimeSlotConfig>>({});
  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedFields, setExpandedFields] = useState<FieldExpanded>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadFields() {
      try {
        const activeFields = await getActiveFields();
        setFields(activeFields);
        
        const initialConfig: Record<string, TimeSlotConfig> = {};
        const expandedState: FieldExpanded = {};
        
        activeFields.forEach((field, index) => {
          initialConfig[field.id] = { 
            startDay: "monday",
            endDay: "friday",
            startTime: "08:00", 
            endTime: "21:00", 
            active: true 
          };
          expandedState[field.id] = index === 0;
        });
        
        setConfig(initialConfig);
        setExpandedFields(expandedState);
      } catch (err: any) {
        setError(err.message || "Error al cargar las canchas");
      } finally {
        setLoadingFields(false);
      }
    }

    loadFields();
  }, []);

  const validateConfig = (fieldId: string): boolean => {
    const cfg = config[fieldId];
    const errors: Record<string, string> = {};

    if (!cfg.startTime) {
      errors[`${fieldId}-startTime`] = "La hora de inicio es requerida";
    }

    if (!cfg.endTime) {
      errors[`${fieldId}-endTime`] = "La hora de fin es requerida";
    }

    if (cfg.startTime && cfg.endTime) {
      const start = new Date(`2000-01-01T${cfg.startTime}`);
      const end = new Date(`2000-01-01T${cfg.endTime}`);

      if (end <= start) {
        errors[`${fieldId}-endTime`] = "La hora de fin debe ser después de la hora de inicio";
      }
    }

    const startIdx = getDayIndex(cfg.startDay);
    const endIdx = getDayIndex(cfg.endDay);

    if (endIdx < startIdx) {
      errors[`${fieldId}-endDay`] = "El día final debe ser igual o posterior al día inicial";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...errors }));
      return false;
    }

    return true;
  };

  const generateTimeSlots = (fieldId: string) => {
    const cfg = config[fieldId];
    const slots = [];
    
    const startIdx = getDayIndex(cfg.startDay);
    const endIdx = getDayIndex(cfg.endDay);
    
    // Para cada día en el rango
    for (let dayIdx = startIdx; dayIdx <= endIdx; dayIdx++) {
      const dayOfWeek = DAYS_OPTIONS[dayIdx].value;
      
      slots.push({
        field_id: fieldId,
        day_of_week: dayOfWeek,
        start_time: cfg.startTime,
        end_time: cfg.endTime,
        is_active: cfg.active,
      });
    }
    
    return slots;
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    setValidationErrors({});

    try {
      // Validar todos
      let allValid = true;
      Object.keys(config).forEach(fieldId => {
        if (!validateConfig(fieldId)) {
          allValid = false;
        }
      });

      if (!allValid) {
        setError("Por favor, corrige los errores antes de guardar");
        setLoading(false);
        return;
      }

      // Generar todos los time slots
      const allTimeSlots: any[] = [];
      Object.keys(config).forEach(fieldId => {
        const slots = generateTimeSlots(fieldId);
        allTimeSlots.push(...slots);
      });

      if (allTimeSlots.length === 0) {
        setError("Debes agregar al menos un horario");
        setLoading(false);
        return;
      }

      const result = await saveTimeSlots(allTimeSlots);
      setMessage(result.message);

      // Limpiar form
      const clearedConfig: Record<string, TimeSlotConfig> = {};
      fields.forEach((field) => {
        clearedConfig[field.id] = { 
          startDay: "monday",
          endDay: "friday",
          startTime: "08:00", 
          endTime: "21:00", 
          active: true 
        };
      });
      setConfig(clearedConfig);

      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Error al guardar horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    fieldId: string, 
    field: "startDay" | "endDay" | "startTime" | "endTime" | "active", 
    value: string | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      [fieldId]: { 
        ...prev[fieldId], 
        [field]: value 
      },
    }));
    
    setValidationErrors(prev => {
      const updated = { ...prev };
      delete updated[`${fieldId}-${field}`];
      return updated;
    });
  };

  const toggleFieldExpanded = (fieldId: string) => {
    setExpandedFields(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const getDayRangeLabel = (cfg: TimeSlotConfig): string => {
    if (cfg.startDay === cfg.endDay) {
      return getDayLabel(cfg.startDay);
    }
    return `${getDayLabel(cfg.startDay)} - ${getDayLabel(cfg.endDay)}`;
  };

  const countDaysInRange = (cfg: TimeSlotConfig): number => {
    const startIdx = getDayIndex(cfg.startDay);
    const endIdx = getDayIndex(cfg.endDay);
    return endIdx - startIdx + 1;
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
        <div className="mt-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-start gap-3 max-w-2xl mx-auto">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-400">{message}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-destructive/20 border border-destructive/50 flex items-start gap-3 max-w-2xl mx-auto">
          <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Información útil */}
      <div className="mt-8 max-w-4xl mx-auto bg-slate-800/50 p-4 rounded-lg border border-emerald-500/30">
        <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Cómo funciona
        </h3>
        <p className="text-sm text-slate-300">
          Selecciona un rango de días (ej: Lunes a Viernes) y un rango de horario (ej: 8 AM a 9 PM). 
          Se crearán franjas automáticamente para cada día en ese rango.
        </p>
      </div>

      {/* Lista de canchas */}
      <div className="mt-8 max-w-4xl mx-auto space-y-3">
        {fields.map((field, index) => {
          const cfg = config[field.id];
          const isExpanded = expandedFields[field.id];
          const hasError = Object.keys(validationErrors).some(key => key.startsWith(field.id));
          const daysCount = cfg ? countDaysInRange(cfg) : 0;

          return (
            <div 
              key={field.id} 
              className={`rounded-lg border transition-all ${
                hasError 
                  ? 'border-destructive/50 bg-destructive/10' 
                  : 'border-white/10 bg-slate-800/40'
              }`}
            >
              {/* Header - Click para expandir */}
              <button
                onClick={() => toggleFieldExpanded(field.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  {/* Imagen miniatura */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={`/cancha${(index % 4) + 1}.png`}
                      width={48}
                      height={48}
                      alt={field.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info de la cancha */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{field.name}</h3>
                    <p className="text-sm text-slate-400 capitalize">{field.type}</p>
                  </div>

                  {/* Resumen: Rango de días y horario */}
                  {cfg && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`px-3 py-1 rounded-full whitespace-nowrap ${
                        cfg.active 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {cfg.startTime} - {cfg.endTime}
                      </span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {getDayRangeLabel(cfg)} ({daysCount}d)
                      </span>
                    </div>
                  )}
                </div>

                {/* Botón expandir */}
                <div className="flex-shrink-0 ml-4">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Contenido expandido */}
              {isExpanded && (
                <div className="border-t border-white/10 p-6 space-y-4">
                  {/* Rango de días */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`startDay-${field.id}`} required>
                        Día Inicio
                      </Label>
                      <Select
                        id={`startDay-${field.id}`}
                        value={cfg?.startDay || "monday"}
                        onChange={(e) =>
                          handleChange(field.id, "startDay", e.target.value)
                        }
                      >
                        {DAYS_OPTIONS.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </Select>
                      {validationErrors[`${field.id}-startDay`] && (
                        <p className="text-xs text-destructive">{validationErrors[`${field.id}-startDay`]}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`endDay-${field.id}`} required>
                        Día Fin
                      </Label>
                      <Select
                        id={`endDay-${field.id}`}
                        value={cfg?.endDay || "friday"}
                        onChange={(e) =>
                          handleChange(field.id, "endDay", e.target.value)
                        }
                      >
                        {DAYS_OPTIONS.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </Select>
                      {validationErrors[`${field.id}-endDay`] && (
                        <p className="text-xs text-destructive">{validationErrors[`${field.id}-endDay`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Rango de horarios */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`startTime-${field.id}`} required>
                        Hora de Inicio
                      </Label>
                      <Input
                        id={`startTime-${field.id}`}
                        type="time"
                        value={cfg?.startTime || ""}
                        onChange={(e) =>
                          handleChange(field.id, "startTime", e.target.value)
                        }
                        className={validationErrors[`${field.id}-startTime`] ? 'border-destructive' : ''}
                      />
                      {validationErrors[`${field.id}-startTime`] && (
                        <p className="text-xs text-destructive">{validationErrors[`${field.id}-startTime`]}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`endTime-${field.id}`} required>
                        Hora de Fin
                      </Label>
                      <Input
                        id={`endTime-${field.id}`}
                        type="time"
                        value={cfg?.endTime || ""}
                        onChange={(e) =>
                          handleChange(field.id, "endTime", e.target.value)
                        }
                        className={validationErrors[`${field.id}-endTime`] ? 'border-destructive' : ''}
                      />
                      {validationErrors[`${field.id}-endTime`] && (
                        <p className="text-xs text-destructive">{validationErrors[`${field.id}-endTime`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Estado activo */}
                  <div className="flex items-center gap-3 pb-1">
                    <Input
                      id={`active-${field.id}`}
                      type="checkbox"
                      checked={cfg?.active ?? true}
                      onChange={(e) =>
                        handleChange(field.id, "active", e.target.checked)
                      }
                    />
                    <Label htmlFor={`active-${field.id}`} className="cursor-pointer">
                      Horario activo
                    </Label>
                  </div>

                  {/* Resumen de lo que se creará */}
                  {cfg && (
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold">📅 Se crearán franjas para:</span>
                      </p>
                      <p className="text-sm text-emerald-400 mt-2">
                        {daysCount} día(s): {getDayRangeLabel(cfg)}
                      </p>
                      <p className="text-sm text-emerald-400">
                        Horario: {cfg.startTime} - {cfg.endTime}
                      </p>
                      <p className="text-sm text-slate-400 mt-2">
                        Total: {daysCount} franja(s) horaria(s)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón guardar */}
      <div className="mt-12 flex justify-center">
        <Button 
          onClick={handleSave} 
          size="lg" 
          disabled={loading}
          className="px-8"
        >
          {loading ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>
    </div>
  );
}
