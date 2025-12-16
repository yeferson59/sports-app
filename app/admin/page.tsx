"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin-header";

export default function HomeAdminPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white p-8">
      {/* HEADER */}
      <AdminHeader title="Panel Administrativo">
        <Link href="/admin/register-instructor">
          <Button variant="default">Registrar instructor</Button>
        </Link>
        <Link href="/admin/registrar-horario-cancha">
          <Button variant="default">Registrar horarios</Button>
        </Link>
        <Link href="/admin/registrar-horario-instructor">
          <Button variant="default">Registrar horarios instructor</Button>
        </Link>
        <Link href="/admin/deshabilitar-cancha">
          <Button variant="destructive">Deshabilitar cancha</Button>
        </Link>
      </AdminHeader>

      {/* CONTENIDO */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* TARJETA 1 */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Bienvenido Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 leading-relaxed">
              Aquí podrás registrar instructores, horarios de las canchas y
              deshabilitar canchas.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CONTENIDO 2 */}
      <section className="w-full mt-8">
        {/* TARJETA 2 */}
        <Card className="h-[400px] overflow-hidden">
          <Image
            src="/clubplay.png"
            alt="Club Padel y Fútbol"
            className="w-full h-full object-cover"
            width="2816"
            height="1536"
          />
        </Card>
      </section>
    </div>
  );
}
