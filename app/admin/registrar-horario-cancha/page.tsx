"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminHeader } from "@/components/admin-header";

type CanchaKey = "cancha1" | "cancha2" | "cancha3" | "cancha4";
type FieldKey = "start" | "end";

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

export default function RegistrarHorarioCancha() {
  const [horarios, setHorarios] = useState<
    Record<CanchaKey, { start: string; end: string }>
  >({
    cancha1: { start: "", end: "" },
    cancha2: { start: "", end: "" },
    cancha3: { start: "", end: "" },
    cancha4: { start: "", end: "" },
  });

  const handleSave = () => {
    console.log("Horarios guardados:", horarios);
    alert("Horarios guardados correctamente ");
  };

  const handleChange = (cancha: CanchaKey, field: FieldKey, value: string) => {
    setHorarios((prev) => ({
      ...prev,
      [cancha]: { ...prev[cancha], [field]: value },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* HEADER */}
      <AdminHeader title="Registrar Horarios de Canchas" />

      {/* TARJETAS */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-10">
        {/* TARJETA GENERICA DE CANCHA */}
        {(["cancha1", "cancha2", "cancha3", "cancha4"] as CanchaKey[]).map(
          (canchaKey, index) => (
            <div key={canchaKey} className={cardClass}>
              <h2 className="text-xl font-semibold mb-4">Cancha {index + 1}</h2>
              <Image
                src={`/cancha${index + 1}.png`}
                width={260}
                height={160}
                alt={`Cancha ${index + 1}`}
                className="rounded-lg w-full object-cover"
              />

              {/* Hora inicio */}
              <div className="w-full flex flex-col gap-2">
                <Label htmlFor={`start-${canchaKey}`} required>
                  Hora inicio
                </Label>
                <Input
                  id={`start-${canchaKey}`}
                  type="time"
                  value={horarios[canchaKey].start}
                  onChange={(e) =>
                    handleChange(canchaKey, "start", e.target.value)
                  }
                  className="mt-2"
                />
              </div>

              {/* Hora fin */}
              <div className="w-full flex flex-col gap-2">
                <Label htmlFor={`end-${canchaKey}`} required>
                  Hora fin
                </Label>
                <Input
                  id={`end-${canchaKey}`}
                  type="time"
                  value={horarios[canchaKey].end}
                  onChange={(e) =>
                    handleChange(canchaKey, "end", e.target.value)
                  }
                  className="mt-2"
                />
              </div>
            </div>
          ),
        )}
      </section>

      {/* BOTÓN GUARDAR */}
      <div className="mt-12 flex justify-center">
        <Button onClick={handleSave} size="lg">
          Guardar horarios
        </Button>
      </div>
    </div>
  );
}
