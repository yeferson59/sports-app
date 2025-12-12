"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";

export default function HomeAdminPage() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* HEADER */}
      <header
        className="w-full flex flex-col sm:flex-row gap-4 justify-between items-center
        bg-slate-800/50 border border-white/10 rounded-xl
        px-6 py-4 shadow-lg backdrop-blur-sm"
      >
        <h1 className="text-2xl font-semibold">Panel Administrativo</h1>

        <div className="flex gap-3 flex-wrap items-center">
          <Link href="/admin/register-instructor">
            <Button variant="default">Registrar instructor</Button>
          </Link>
          <Link href="/admin/registrar-horario-cancha">
            <Button variant="default">Registrar horarios</Button>
          </Link>
          <Link href="/admin/deshabilitar-cancha">
            <Button variant="destructive">Deshabilitar cancha</Button>
          </Link>

          {!isPending && session && <UserMenu user={session.user} />}
        </div>
      </header>

      {/* CONTENIDO */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* TARJETA 1 */}
        <div
          className="col-span-2 bg-slate-800/40 rounded-xl
          p-8 border border-white/10 shadow-xl backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold mb-4">Bienvenido Admin</h2>

          <p className="text-slate-300 leading-relaxed">
            Aquí podrás registrar instructores, horarios de las canchas y
            deshabilitar canchas.
          </p>
        </div>
      </section>
      {/*CONTENIDO 2*/}
      <section className="w-full mt-8">
        {/* TARJETA 2 */}
        <div className="rounded-xl h-[400px] border border-white/10 shadow-xl overflow-hidden">
          <Image
            src="/clubplay.png"
            alt="Club Padel y Fútbol"
            className="w-full h-full object-cover"
            width="2816"
            height="1536"
          />
        </div>
      </section>
    </div>
  );
}
