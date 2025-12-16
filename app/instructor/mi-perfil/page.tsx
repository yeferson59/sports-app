"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstructorHeader } from "@/components/instructor-header";
import { getInstructorProfile } from "./action";
import { User } from "lucide-react";

export default function InstructorProfilePage() {
  const [profile, setProfile] = useState<{
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<{
    name?: string | null;
    email?: string | null;
  }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getInstructorProfile();
        setProfile(data);
        setFormData({
          name: data.name,
          email: data.email,
        });
      } catch (err: any) {
        setError(err.message || "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setMessage(null);
    setError(null);

    // Por ahora solo mostramos un mensaje
    setMessage("Los cambios serán guardados en futuras versiones");
    setEditing(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <InstructorHeader>
          <Link href="/instructor">
            <Button variant="outline">← Volver</Button>
          </Link>
        </InstructorHeader>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">Cargando perfil...</p>
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <InstructorHeader>
          <Link href="/instructor">
            <Button variant="outline">← Volver</Button>
          </Link>
        </InstructorHeader>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-slate-800/40 rounded-2xl border border-white/10 p-12 text-center">
            <p className="text-xl text-slate-400">No se pudo cargar el perfil</p>
          </div>
        </div>
      </main>
    );
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "I";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <InstructorHeader>
        <Link href="/instructor">
          <Button variant="outline">← Volver</Button>
        </Link>
      </InstructorHeader>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold">Mi Perfil</h1>
          <p className="mt-2 text-slate-300 text-lg">Gestiona tu información personal</p>
        </header>

        {/* Mensajes */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50">
            <p className="text-green-400">{message}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-slate-800/40 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-white/10 p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-cyan-400 to-blue-400 shadow-lg">
                {profile?.image ? (
                  <img
                    src={profile.image}
                    alt={profile?.name || "Instructor"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <User className="w-12 h-12 text-slate-900" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{profile?.name || "Sin nombre"}</h2>
                <p className="text-slate-400 text-sm">{profile?.email || "Sin email"}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 space-y-6">
            {editing ? (
              <>
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Nombre Completo
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    className="bg-slate-700/50 border-white/10 text-white placeholder-slate-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className="bg-slate-700/50 border-white/10 text-white placeholder-slate-500"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profile.name,
                        email: profile.email,
                      });
                      setMessage(null);
                      setError(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Ver información */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400">Nombre Completo</p>
                    <p className="text-lg font-semibold text-white">
                      {profile?.name || "No especificado"}
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm text-slate-400">Correo Electrónico</p>
                    <p className="text-lg font-semibold text-white">
                      {profile?.email || "No especificado"}
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm text-slate-400">ID de Usuario</p>
                    <p className="text-sm font-mono text-slate-300">{profile?.id}</p>
                  </div>
                </div>

                {/* Botón Editar */}
                <div className="pt-4 border-t border-white/10">
                  <Button
                    onClick={() => setEditing(true)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    Editar Perfil
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-slate-800/40 rounded-xl border border-cyan-500/30 p-6">
          <h3 className="text-sm font-semibold text-cyan-400 mb-3">ℹ️ Información</h3>
          <ul className="text-sm text-slate-300 space-y-2">
            <li>✓ Este es tu perfil como instructor en ClubPlay</li>
            <li>✓ Aquí puedes ver y gestionar tu información personal</li>
            <li>✓ Los cambios se guardarán en tu cuenta</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
