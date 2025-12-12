"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CustomerHomePage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">

      {/* NAVBAR */}
      <nav className="w-full px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-emerald-400 to-cyan-400 shadow">
            <svg
              viewBox="0 0 64 64"
              width="22"
              height="22"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="20" cy="20" r="12" fill="#0f172a" />
              <path
                d="M39 10c6 0 12 6 12 12s-6 12-12 12-12-6-12-12 6-12 12-12z"
                fill="#fef3c7"
              />
              <rect
                x="33"
                y="33"
                width="18"
                height="6"
                rx="3"
                transform="rotate(-35 33 33)"
                fill="#fde68a"
              />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-white">ClubPlay</h1>
        </div>

        <Button
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Cerrar sesión
        </Button>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <section className="max-w-4xl mx-auto px-6 py-12">

        <header className="mb-10">
          <h1 className="text-4xl font-bold">Bienvenido 👋</h1>
          <p className="mt-2 text-slate-300 text-lg">
            ¿Qué deseas hacer hoy?
          </p>
        </header>

        {/* GRID DE OPCIONES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Apartar cancha */}
          <Link href="/">
            <div className="group cursor-pointer p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-300/50 backdrop-blur-md transition-all hover:shadow-lg">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                 Apartar cancha
              </h2>
              <p className="text-slate-300 mt-2 text-sm">
                Agenda tu reserva en segundos.
              </p>
            </div>
          </Link>

          {/* Disponibilidad */}
          <Link href="/obtener-disponibilidad-cancha">
            <div className="group cursor-pointer p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-300/50 backdrop-blur-md transition-all hover:shadow-lg">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                 Ver disponibilidad
              </h2>
              <p className="text-slate-300 mt-2 text-sm">
                Consulta horarios disponibles de cada cancha.
              </p>
            </div>
          </Link>

          {/* Cancelar cancha */}
          <Link href="/">
            <div className="group cursor-pointer p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-red-300/50 backdrop-blur-md transition-all hover:shadow-lg">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                 Cancelar reserva
              </h2>
              <p className="text-slate-300 mt-2 text-sm">
                Cancela una reserva activa.
              </p>
            </div>
          </Link>

          {/* Mis reservas */}
          <Link href="/">
            <div className="group cursor-pointer p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-300/50 backdrop-blur-md transition-all hover:shadow-lg">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                 Mis reservas
              </h2>
              <p className="text-slate-300 mt-2 text-sm">
                Consulta tu historial y próximas reservas.
              </p>
            </div>
          </Link>

        </div>
      </section>
    </main>
  );
}
