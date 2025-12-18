"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getFullAvailability } from "./action";
import { CustomerHeader } from "@/components/customer-header";
import { Button } from "@/components/ui/button";

interface TimeSlot {
  id: string;
  dayOfWeek: string;
  startTime: Date;
  endTime: Date;
  surchargePercent: string;
  isActive: boolean;
}

interface FieldAvailability {
  id: string;
  name: string;
  type: string;
  timeslots: TimeSlot[];
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

const DAYS_ES: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

/* Solo hay 4 imágenes:
   cancha1.png y cancha2.png => imágenes de fútbol
   cancha3.png y cancha4.png => imágenes de pádel
   Se alterna entre las dos imágenes de cada tipo según la paridad del índice. */
function getFieldImage(type: string | undefined, index: number) {
  // fallback: ciclar entre 1..4 si no hay tipo
  if (!type) return `/cancha${(index % 4) + 1}.png`;

  const key = type
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // quitar espacios y caracteres no alfanuméricos

  // Claves que consideramos como fútbol
  const futbolKeys = new Set([
    "futbol",
    "futbol6",
    "futbol11",
    "football",
    "soccer",
  ]);
  // Claves que consideramos como pádel
  const padelKeys = new Set(["padel", "paddle"]);

  if (futbolKeys.has(key)) {
    // Alterna entre cancha1 y cancha2 según la paridad del índice
    return `/cancha${(index % 2) + 1}.png`;
  }

  if (padelKeys.has(key)) {
    // Alterna entre cancha3 y cancha4 según la paridad del índice
    return `/cancha${3 + (index % 2)}.png`;
  }

  // Fallback general: usa la secuencia 1..4
  return `/cancha${(index % 4) + 1}.png`;
}

export default function DisponibilidadCanchas() {
  const [fields, setFields] = useState<FieldAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getFullAvailability();
      setFields(data);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white flex justify-center items-center">
        <p className="text-xl">Cargando disponibilidad...</p>
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
          <h1 className="text-4xl font-bold mb-2">Disponibilidad de Canchas</h1>
          <p className="text-slate-300">
            Consulta los horarios disponibles de todas nuestras canchas
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-10">
          {fields.map((field, index) => (
            <div key={field.id} className={cardClass}>
              <h2 className="text-xl font-semibold">{field.name}</h2>

              <Image
                src={getFieldImage(field.type, index)}
                width={260}
                height={160}
                alt={field.name}
                className="rounded-lg w-full object-cover"
              />

              <div className="w-full mt-4 flex flex-col gap-2">
                <h3 className="font-semibold text-emerald-400 text-lg">
                  Horarios disponibles
                </h3>

                {field.timeslots.length === 0 && (
                  <p className="text-slate-400">Sin horarios registrados.</p>
                )}

                {field.timeslots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <p className="text-sm">
                      <span className="text-emerald-300 font-semibold">
                        {DAYS_ES[slot.dayOfWeek]}:
                      </span>{" "}
                      {new Date(slot.startTime).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(slot.endTime).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
