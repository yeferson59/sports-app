"use client";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-6">
      {/* Accessible status region (for future async feedback) */}
      <div aria-live="polite" className="sr-only" id="auth-status" />

      {/* Decorative background shapes (reduced-motion aware) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden -z-10"
      >
        <svg
          className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-20 motion-safe:animate-pulse"
          width="600"
          height="600"
          viewBox="0 0 600 600"
          fill="none"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0" stopColor="#06b6d4" />
              <stop offset="1" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <circle cx="300" cy="300" r="200" fill="url(#g1)" />
        </svg>

        <svg
          className="absolute left-0 bottom-0 -translate-x-1/4 translate-y-1/4 opacity-10 motion-safe:animate-pulse"
          width="420"
          height="420"
          viewBox="0 0 420 420"
          fill="none"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="g2" x1="0" x2="1">
              <stop offset="0" stopColor="#ef4444" />
              <stop offset="1" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="420" height="420" rx="100" fill="url(#g2)" />
        </svg>
      </div>

      <section
        className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8"
        aria-labelledby="login-heading"
      >
        {/* Left - Brand / Illustration */}
        <aside className="hidden md:flex flex-col justify-center rounded-2xl p-8 bg-white/5 backdrop-blur-sm ring-1 ring-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-linear-to-br from-emerald-400 to-cyan-400 shadow-md">
              {/* Combined sports icon: football + padel racket (decorative) */}
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
            <h3 className="mt-2">Reserva tu cancha en segundos</h3>
            <p className="text-sm">
              Gestión rápida y sencilla para recibir reservas de fútbol 6 y
              pádel. Diseñado para dueños y usuarios — limpia, moderna y móvil.
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-400 text-slate-900 text-xs font-bold">
                  ✓
                </span>
                Interfaz optimizada para móviles y kioscos.
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-400 text-slate-900 text-xs font-bold">
                  ✓
                </span>
                Gestión de horarios, reservas y pagos.
              </li>
            </ul>
          </div>
        </aside>

        {/* Right - Login Card */}
        <div className="flex items-center justify-center">
          <div
            role="region"
            aria-labelledby="login-heading"
            className="w-full max-w-md rounded-2xl bg-white/6 backdrop-blur-lg ring-1 ring-white/10 p-8 shadow-xl"
          >
            <header className="mb-6">
              <h1 id="login-heading" className="text-3xl font-bold text-white">
                Iniciar sesión
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Ingresa con tu cuenta de administrador o cliente para gestionar
                reservas.
              </p>
            </header>

            <form
              className="space-y-4"
              action="#"
              method="POST"
              aria-describedby="auth-status"
              noValidate
            >
              <label htmlFor="email" className="block">
                <span className="text-sm text-slate-300">
                  Correo electrónico
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  aria-required="true"
                  className="mt-2 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 transition-transform motion-safe:transform-gpu motion-safe:duration-150"
                  placeholder="tucorreo@ejemplo.com"
                />
              </label>

              <label htmlFor="password" className="block">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Contraseña</span>
                  <a href="#" className="text-emerald-300 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  aria-required="true"
                  className="mt-2 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 transition-transform motion-safe:transform-gpu motion-safe:duration-150"
                  placeholder="••••••••"
                />
              </label>

              <div className="flex items-center justify-between text-sm text-slate-300">
                <label
                  className="inline-flex items-center gap-2"
                  htmlFor="remember"
                >
                  <input
                    id="remember"
                    type="checkbox"
                    name="remember"
                    className="w-4 h-4 rounded border-white/20 bg-white/3 accent-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300"
                  />
                  <span>Mantener sesión</span>
                </label>

                <a href="#" className="text-emerald-300 hover:underline">
                  Ayuda
                </a>
              </div>

              {/* Primary action replaced with shadcn `Button` */}
              <Button
                type="submit"
                aria-label="Entrar en ClubPlay"
                // Use shadcn Button defaults but override visual appearance for brand gradient
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-400 to-cyan-400 px-4 py-3 font-semibold text-slate-900 shadow hover:brightness-105 focus-visible:translate-y-0.5 motion-safe:transition-transform motion-safe:duration-150 motion-reduce:transition-none"
              >
                {/* Decorative svg icon inside button; non-interactive for assistive tech */}
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
                    d="M12 11c.828 0 1.5-.672 1.5-1.5S12.828 8 12 8s-1.5.672-1.5 1.5S11.172 11 12 11z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 11v6a2 2 0 002 2h8a2 2 0 002-2v-6M8 11V8a4 4 0 118 0v3"
                  />
                </svg>
                <span>Entrar</span>
              </Button>

              {/* Social sign-in / alternatives */}
              <div className="pt-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-slate-300">
                      o continúa con
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/7 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 transition-transform motion-safe:duration-150 active:scale-95"
                    aria-label="Iniciar sesión con Google"
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
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/7 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 transition-transform motion-safe:duration-150 active:scale-95"
                    aria-label="Iniciar sesión con Facebook"
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
              ¿No tienes cuenta?{" "}
              <a href="#" className="text-emerald-300 hover:underline">
                Regístrate
              </a>
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}
