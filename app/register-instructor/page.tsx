"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterInstructorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-6">
      <div id="register-status" aria-live="polite" className="sr-only" />

      {/* Background SVGs */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute -right-16 -top-16 opacity-20 motion-safe:animate-pulse"
          width="600"
          height="600"
          viewBox="0 0 600 600"
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
        aria-labelledby="register-instructor-heading"
      >
        {/* Left side */}
        <aside className="hidden md:flex flex-col justify-center rounded-2xl p-8 bg-white/5 backdrop-blur-sm ring-1 ring-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-md">
              <svg
                viewBox="0 0 64 64"
                width="28"
                height="28"
                fill="none"
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
              <h2 className="text-2xl font-semibold text-white">ClubPlay</h2>
              <p className="text-sm text-slate-300">
                Registro de instructores
              </p>
            </div>
          </div>

          <div className="prose prose-invert text-slate-200">
            <h3 className="mt-2">Alta de instructores</h3>
            <p className="text-sm">
              Registra nuevos profesores para las clases de pádel.
              Podrás asignar horarios, campos y gestionar disponibilidad.
            </p>
          </div>
        </aside>

        {/* Right side form */}
        <div className="flex items-center justify-center">
          <div
            role="region"
            aria-labelledby="register-instructor-heading"
            className="w-full max-w-md rounded-2xl bg-white/6 backdrop-blur-lg ring-1 ring-white/10 p-8 shadow-xl"
          >
            <header className="mb-6">
              <h1
                id="register-instructor-heading"
                className="text-3xl font-bold text-white"
              >
                Registrar Instructor
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Completa la información del nuevo instructor.
              </p>
            </header>

            <form className="space-y-4" action="#" method="POST" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Nombre"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Apellido"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+54 9 11 1234 5678"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="sport">Disciplina</Label>
                <select
                  id="sport"
                  name="sport"
                  className="mt-2 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <option value="padel">Pádel</option>
                  <option value="futbol">Fútbol</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 font-semibold text-slate-900 shadow hover:brightness-105 active:scale-95"
              >
                Registrar Instructor
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
