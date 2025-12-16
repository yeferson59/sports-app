"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomerHeader } from "@/components/customer-header";

export default function CustomerHomePage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      {/* NAVBAR */}
      <CustomerHeader>
        <Button variant="destructive">
          Cerrar sesión
        </Button>
      </CustomerHeader>

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
          <Link href="/customer/apartar-cancha">
            <Card className="group cursor-pointer hover:border-emerald-300/50 transition-all hover:shadow-lg h-full">
              <CardHeader>
                <CardTitle>Apartar cancha</CardTitle>
                <CardDescription>
                  Agenda tu reserva en segundos.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Disponibilidad */}
          <Link href="/customer/obtener-disponibilidad-cancha">
            <Card className="group cursor-pointer hover:border-emerald-300/50 transition-all hover:shadow-lg h-full">
              <CardHeader>
                <CardTitle>Ver disponibilidad</CardTitle>
                <CardDescription>
                  Consulta horarios disponibles de cada cancha.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Cancelar cancha */}
          <Link href="/">
            <Card className="group cursor-pointer hover:border-destructive/50 transition-all hover:shadow-lg h-full">
              <CardHeader>
                <CardTitle>Cancelar reserva</CardTitle>
                <CardDescription>
                  Cancela una reserva activa.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Mis reservas */}
          <Link href="/">
            <Card className="group cursor-pointer hover:border-emerald-300/50 transition-all hover:shadow-lg h-full">
              <CardHeader>
                <CardTitle>Mis reservas</CardTitle>
                <CardDescription>
                  Consulta tu historial y próximas reservas.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

        </div>
      </section>
    </main>
  );
}
