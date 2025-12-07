"use client";

import Image from "next/image";
import { useState } from "react";

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

  // Aquí luego tengo que conectar con la base de datos
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
      <header
        className="w-full bg-slate-800/50 border border-white/10 rounded-xl
          px-6 py-4 shadow-lg backdrop-blur-sm"
      >
        <h1 className="text-2xl font-semibold">
          Registrar Horarios de Canchas
        </h1>
      </header>

      {/* TARJETAS */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-10">
        {/* TARJETA GENERICA DE CANCHA */}
        {(["cancha1", "cancha2", "cancha3", "cancha4"] as CanchaKey[]).map(
          (canchaKey, index) => (
            <div key={canchaKey} className={cardClass}>
              <h2 className="text-xl font-semibold mb-4">Cancha</h2>
              <Image
                src={`/cancha${index + 1}.png`}
                width={260}
                height={160}
                alt={`Cancha ${index + 1}`}
                className="rounded-lg w-full object-cover"
              />

              {/* Hora inicio */}
              <div className="w-full flex flex-col gap-2">
                <label className="text-sm text-slate-300">Hora inicio</label>
                <input
                  type="time"
                  className="bg-slate-700 p-2 rounded border border-white/10"
                  value={horarios[canchaKey].start}
                  onChange={(e) =>
                    handleChange(canchaKey, "start", e.target.value)
                  }
                />
              </div>

              {/* Hora fin */}
              <div className="w-full flex flex-col gap-2">
                <label className="text-sm text-slate-300">Hora fin</label>
                <input
                  type="time"
                  className="bg-slate-700 p-2 rounded border border-white/10"
                  value={horarios[canchaKey].end}
                  onChange={(e) =>
                    handleChange(canchaKey, "end", e.target.value)
                  }
                />
              </div>
            </div>
          ),
        )}
      </section>

      {/* BOTÓN GUARDAR */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={handleSave}
          className="
            bg-linear-to-r from-emerald-400 to-cyan-400
            px-8 py-3 rounded-xl
            text-slate-900 font-semibold
            shadow-lg hover:brightness-105
            transition-all
          "
        >
          Guardar horarios
        </button>
      </div>
    </div>
  );
}
