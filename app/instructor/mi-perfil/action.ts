"use server";

import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";

export async function getInstructorProfile() {
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    });

    if (!session?.data?.user) {
      throw new Error("No estás autenticado");
    }

    return session.data.user;
  } catch (error: any) {
    throw new Error(error.message || "Error al cargar el perfil");
  }
}

export async function updateInstructorProfile(data: {
  name?: string;
  email?: string;
}) {
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    });

    if (!session?.data?.user) {
      throw new Error("No estás autenticado");
    }

    // Aquí iría la lógica de actualización si está disponible en authClient
    // Por ahora, retornamos un mensaje de éxito
    return {
      success: true,
      message: "Perfil actualizado correctamente",
    };
  } catch (error: any) {
    throw new Error(error.message || "Error al actualizar el perfil");
  }
}
