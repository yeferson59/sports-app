"use client";

import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-6">
      {/* Screen-reader status for async form feedback */}
      <div id="register-status" aria-live="polite" className="sr-only" />

      {/* Background decorative SVGs (respect prefers-reduced-motion) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 overflow-hidden"
      >
        <svg
          className="absolute -right-16 -top-16 opacity-20 motion-safe:animate-pulse"
          width="600"
          height="600"
          viewBox="0 0 600 600"
          fill="none"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="rg1" x1="0" x2="1">
              <stop offset="0" stopColor="#06b6d4" />
              <stop offset="1" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <circle cx="300" cy="300" r="220" fill="url(#rg1)" />
        </svg>

        <svg
          className="absolute -left-12 -bottom-12 opacity-10 motion-safe:animate-pulse"
          width="420"
          height="420"
          viewBox="0 0 420 420"
          fill="none"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="rg2" x1="0" x2="1">
              <stop offset="0" stopColor="#f97316" />
              <stop offset="1" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="420" height="420" rx="96" fill="url(#rg2)" />
        </svg>
      </div>

      <section
        className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8"
        aria-labelledby="register-heading"
      >
        {/* Left - Brand and selling points */}
        <aside className="hidden md:flex flex-col justify-center rounded-2xl p-8 bg-white/5 backdrop-blur-sm ring-1 ring-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-linear-to-br from-emerald-400 to-cyan-400 shadow-md">
              <svg
                viewBox="0 0 64 64"
                width="28"
                height="28"
                fill="none"
                aria-hidden="true"
                focusable="false"
                className="text-slate-900"
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

            <div>
              <h2
                id="brand-title"
                className="text-2xl font-semibold text-white"
              >
                ClubPlay
              </h2>
              <p className="text-sm text-slate-300">
                Canchas de fútbol 6 & pádel
              </p>
            </div>
          </div>

          <div className="prose prose-invert text-slate-200">
            <h3 className="mt-2">Únete en segundos</h3>
            <p className="text-sm">
              Regístrate para reservar canchas, administrar tus horarios y
              recibir confirmaciones automáticas.
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-400 text-slate-900 text-xs font-bold">
                  ✓
                </span>
                Reservas rápidas y seguras.
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-400 text-slate-900 text-xs font-bold">
                  ✓
                </span>
                Gestión de pagos y horarios.
              </li>
            </ul>
          </div>
        </aside>

        {/* Right - Register form */}
        <div className="flex items-center justify-center">
          <div
            role="region"
            aria-labelledby="register-heading"
            className="w-full max-w-md rounded-2xl bg-white/6 backdrop-blur-lg ring-1 ring-white/10 p-8 shadow-xl"
          >
            <header className="mb-6">
              <h1
                id="register-heading"
                className="text-3xl font-bold text-white"
              >
                Crear cuenta
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Regístrate para reservar canchas y gestionar tus horarios.
              </p>
            </header>

            <form
              className="space-y-4"
              action={signUp}
              aria-describedby="register-status"
              noValidate
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    inputMode="text"
                    autoComplete="given-name"
                    required
                    aria-required="true"
                    placeholder="Nombre"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    inputMode="text"
                    autoComplete="family-name"
                    placeholder="Apellido"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" required>
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  aria-required="true"
                  placeholder="tu@correo.com"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="password" required>
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    placeholder="••••••••"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" required>
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    placeholder="••••••••"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="mt-1 w-4 h-4"
                  aria-required="true"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  Acepto los{" "}
                  <a href="#" className="text-emerald-300 hover:underline">
                    términos y condiciones
                  </a>
                </label>
              </div>

              {/* Primary action uses shadcn Button with microinteraction classes */}
              <Button
                type="submit"
                aria-label="Crear cuenta"
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-400 to-cyan-400 px-4 py-3 font-semibold text-slate-900 shadow hover:brightness-105 active:scale-95 motion-safe:transition-transform motion-safe:duration-150"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"
                  />
                </svg>
                Crear cuenta
              </Button>

              <div className="pt-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-slate-300">
                      o regístrate con
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    aria-label="Registrarse con Google"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/7 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-95 motion-safe:transition-transform motion-safe:duration-150"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        fill="#EA4335"
                        d="M21 12.27c0-.73-.07-1.27-.22-1.82H12v3.44h5.35c-.1.85-.68 2.09-1.86 2.77v2.3h3.01C20.47 17.1 21 14.98 21 12.27z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 22c2.43 0 4.48-.8 5.97-2.17l-3.01-2.3c-.83.56-1.9.95-2.96.95-2.28 0-4.21-1.54-4.9-3.62H3.97v2.28C5.46 19.95 8.52 22 12 22z"
                      />
                      <path
                        fill="#4A90E2"
                        d="M6.99 13.86A6.99 6.99 0 016 12c0-.67.11-1.31.31-1.93V7.79H3.97A10.98 10.98 0 002 12c0 1.77.43 3.44 1.2 4.94l3.79-3.08z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M12 6.24c1.32 0 2.5.45 3.42 1.34l2.56-2.56C16.46 3.19 14.43 2.5 12 2.5 8.52 2.5 5.46 4.55 3.97 7.21l3.79 2.28C7.79 7.78 9.72 6.24 12 6.24z"
                      />
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    aria-label="Registrarse con Facebook"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/7 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-95 motion-safe:transition-transform motion-safe:duration-150"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        fill="#1877F2"
                        d="M22 12a10 10 0 10-11.5 9.87v-6.99H8.9V12h1.6V9.8c0-1.6.95-2.48 2.4-2.48.7 0 1.43.12 1.43.12v1.57h-.8c-.79 0-1.03.49-1.03.99V12h1.75l-.28 2.88h-1.47v6.99A10 10 0 0022 12z"
                      />
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>
            </form>

            <footer className="mt-6 text-center text-sm text-slate-400">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-emerald-300 hover:underline">
                Inicia sesión
              </Link>
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}
