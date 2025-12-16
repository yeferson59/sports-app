"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { InstructorHeader } from "@/components/instructor-header";

export default function InstructorHomePage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      {/* NAVBAR */}
      <InstructorHeader />

      {/* CONTENIDO PRINCIPAL */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold">Bienvenido 👋</h1>
          <p className="mt-2 text-slate-300 text-lg">¿Qué deseas hacer hoy?</p>
        </header>

        {/* GRID DE OPCIONES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ver horarios */}
          <Link href="/instructor/obtener-horarios">
            <Card className="group cursor-pointer hover:border-emerald-300/50 transition-all hover:shadow-lg h-full">
              <CardHeader>
                <CardTitle>Ver mis horarios</CardTitle>
                <CardDescription>
                  Consulta los horarios con reservas asignadas.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Perfil */}
          <Link href="/instructor/mi-perfil">
            <Card className="group cursor-pointer hover:border-cyan-300/50 transition-all hover:shadow-lg h-full">
              <CardHeader>
                <CardTitle>Mi perfil</CardTitle>
                <CardDescription>
                  Gestiona tu información personal.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </main>
  );
}
