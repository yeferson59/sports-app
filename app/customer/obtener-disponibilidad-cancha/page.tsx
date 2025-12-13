"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getFullAvailability } from "./action";
import { AdminHeader } from "@/components/admin-header";

interface TimeSlot {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
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
      <div className="min-h-screen bg-slate-900 text-white p-8 flex justify-center items-center">
        <p className="text-xl">Cargando disponibilidad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <AdminHeader title="Disponibilidad de Canchas" />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-10">
        {fields.map((field, index) => (
          <div key={field.id} className={cardClass}>
            
            <h2 className="text-xl font-semibold">{field.name}</h2>

            <Image
              src={`/cancha${(index % 4) + 1}.png`}
              width={260}
              height={160}
              alt={field.name}
              className="rounded-lg w-full object-cover"
            />

            <div className="w-full mt-4 flex flex-col gap-2">
              <h3 className="font-semibold text-cyan-400 text-lg">
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
                    <span className="text-cyan-300 font-semibold">
                      {DAYS_ES[slot.day_of_week]}:
                    </span>{" "}
                    {slot.start_time} - {slot.end_time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
