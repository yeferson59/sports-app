import Link from "next/link";
import Image from "next/image";

export default function HomeAdminPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* HEADER */}
      <header
        className="w-full flex justify-between items-center
        bg-slate-800/50 border border-white/10 rounded-xl
        px-6 py-4 shadow-lg backdrop-blur-sm"
      >
        <h1 className="text-2xl font-semibold">Panel Administrativo</h1>

        <Link href="/register-instructor">
          <button
            className="bg-linear-to-r from-emerald-400 to-cyan-400
            px-4 py-2 rounded-lg text-slate-900 font-semibold shadow
            hover:brightness-105 transition"
          >
            Registrar instructor
          </button>
        </Link>
        <Link href="/registrar-horario-cancha">
          <button
            className="bg-linear-to-r from-emerald-400 to-cyan-400
            px-4 py-2 rounded-lg text-slate-900 font-semibold shadow
            hover:brightness-105 transition"
          >
            Registrar horario canchas
          </button>
        </Link>

        <button
          className="bg-linear-to-r from-emerald-400 to-cyan-400
          px-4 py-2 rounded-lg text-slate-900 font-semibold shadow
          hover:brightness-105 transition"
        >
          Deshabilitar cancha
        </button>
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
            deshabilitar cancha.
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
            width="100"
            height="100"
          />
        </div>
      </section>
    </div>
  );
}
