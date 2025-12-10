"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminHeader } from "@/components/admin-header";

export default function RegisterInstructorPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <AdminHeader title="Registrar Instructor" />

      <div className="flex items-center justify-center mt-8">
        <div
          role="region"
          aria-labelledby="register-instructor-heading"
          className="w-full max-w-md rounded-2xl bg-slate-800/40 border border-white/10 p-8 shadow-xl backdrop-blur-sm"
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
                <Label htmlFor="firstName" required>
                  Nombre
                </Label>
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
                <Label htmlFor="lastName" required>
                  Apellido
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Apellido"
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" required>
                Correo
              </Label>
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
              <Label htmlFor="sport" required>
                Disciplina
              </Label>
              <select
                id="sport"
                name="sport"
                required
                className="mt-2 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 transition-shadow motion-safe:duration-150"
              >
                <option value="">Selecciona una disciplina</option>
                <option value="padel">Pádel</option>
              </select>
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
                  placeholder="••••••••"
                  className="mt-2"
                  required
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
                  placeholder="••••••••"
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2">
              Registrar Instructor
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
