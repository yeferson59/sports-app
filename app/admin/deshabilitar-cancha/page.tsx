"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin-header";
import { getAllFields, disableField, enableField } from "./action";

interface Field {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  created_at: Date;
}

const cardClass = `
  relative
  bg-slate-800/40
  rounded-xl
  border border-white/10
  shadow-xl
  backdrop-blur-sm
  p-6
  flex flex-col
  items-center
  gap-4
  transition-all
  duration-300
`;

export default function DeshabilitarCanchaPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingFields, setLoadingFields] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFields = async () => {
    try {
      const allFields = await getAllFields();
      setFields(allFields);
    } catch (err: any) {
      setError(err.message || "Error al cargar las canchas");
    } finally {
      setLoadingFields(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleToggleField = async (fieldId: string, currentStatus: boolean) => {
    setLoading(fieldId);
    setMessage(null);
    setError(null);

    try {
      let result;
      if (currentStatus) {
        // Si está activa, deshabilitar
        result = await disableField(fieldId);
      } else {
        // Si está inactiva, habilitar
        result = await enableField(fieldId);
      }

      setMessage(result.message);
      
      // Recargar las canchas
      await loadFields();
    } catch (err: any) {
      setError(err.message || "Error al cambiar el estado de la cancha");
    } finally {
      setLoading(null);
    }
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
        <AdminHeader title="Gestionar Canchas" />
        <div className="mt-10 text-center">
          <p className="text-xl text-slate-400">
            No hay canchas registradas. Por favor, registra canchas primero.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <AdminHeader title="Gestionar Canchas" />

      {/* Mensajes */}
      {message && (
        <div className="mt-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50 max-w-2xl mx-auto">
          <p className="text-emerald-400 text-center">{message}</p>
        </div>
      )}
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-destructive/20 border border-destructive/50 max-w-2xl mx-auto">
          <p className="text-destructive text-center">{error}</p>
        </div>
      )}

      {/* Información */}
      <div className="mt-6 text-center text-slate-300">
        <p className="text-sm">
          Las canchas deshabilitadas no aparecerán en el registro de horarios
        </p>
      </div>

      {/* Tarjetas de canchas */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-10">
        {fields.map((field, index) => (
          <div 
            key={field.id} 
            className={`${cardClass} ${!field.is_active ? 'opacity-60 border-destructive/30' : ''}`}
          >
            {/* Badge de estado */}
            <div className="absolute top-4 right-4">
              {field.is_active ? (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
                  Activa
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-destructive/20 text-destructive border border-destructive/50">
                  Deshabilitada
                </span>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-4 mt-6">{field.name}</h2>
            
            <Image
              src={`/cancha${(index % 4) + 1}.png`}
              width={260}
              height={160}
              alt={field.name}
              className={`rounded-lg w-full object-cover ${!field.is_active ? 'grayscale' : ''}`}
            />

            <div className="w-full text-center space-y-2">
              <p className="text-sm text-slate-400 capitalize">
                Tipo: <span className="text-white">{field.type}</span>
              </p>
            </div>

            {/* Botón de acción */}
            <Button
              onClick={() => handleToggleField(field.id, field.is_active)}
              disabled={loading === field.id}
              variant={field.is_active ? "destructive" : "default"}
              className="w-full mt-2"
            >
              {loading === field.id
                ? 'Procesando...'
                : field.is_active
                ? 'Deshabilitar Cancha'
                : 'Habilitar Cancha'}
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}