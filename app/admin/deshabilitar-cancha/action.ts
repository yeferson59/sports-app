"use server";

import { db } from "@/db";
import { field } from "@/auth-schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Obtener todas las canchas (activas e inactivas)
export async function getAllFields() {
  const allFields = await db
    .select({
      id: field.id,
      name: field.name,
      type: field.type,
      is_active: field.is_active,
      created_at: field.created_at,
    })
    .from(field)
    .orderBy(field.name);

  return allFields;
}

// Deshabilitar una cancha (cambiar is_active a false)
export async function disableField(fieldId: string) {
  // Verificar que la cancha existe
  const existingField = await db
    .select()
    .from(field)
    .where(eq(field.id, fieldId))
    .limit(1);

  if (existingField.length === 0) {
    throw new Error("La cancha no existe");
  }

  if (!existingField[0].is_active) {
    throw new Error("La cancha ya está deshabilitada");
  }

  // Deshabilitar la cancha
  const updatedField = await db
    .update(field)
    .set({ 
      is_active: false,
      updated_at: new Date(),
    })
    .where(eq(field.id, fieldId))
    .returning();

  // Revalidar las rutas que muestran canchas
  revalidatePath("/admin/deshabilitar-cancha");
  revalidatePath("/admin/registrar-horario-cancha");

  return {
    success: true,
    field: updatedField[0],
    message: `La cancha "${updatedField[0].name}" ha sido deshabilitada correctamente.`,
  };
}

// Habilitar una cancha (cambiar is_active a true)
export async function enableField(fieldId: string) {
  // Verificar que la cancha existe
  const existingField = await db
    .select()
    .from(field)
    .where(eq(field.id, fieldId))
    .limit(1);

  if (existingField.length === 0) {
    throw new Error("La cancha no existe");
  }

  if (existingField[0].is_active) {
    throw new Error("La cancha ya está habilitada");
  }

  // Habilitar la cancha
  const updatedField = await db
    .update(field)
    .set({ 
      is_active: true,
      updated_at: new Date(),
    })
    .where(eq(field.id, fieldId))
    .returning();

  // Revalidar las rutas que muestran canchas
  revalidatePath("/admin/deshabilitar-cancha");
  revalidatePath("/admin/registrar-horario-cancha");

  return {
    success: true,
    field: updatedField[0],
    message: `La cancha "${updatedField[0].name}" ha sido habilitada correctamente.`,
  };
}