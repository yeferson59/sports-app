"use server";

import { db } from "@/db";
import { user, role } from "@/auth-schema";
import { eq } from "drizzle-orm";

export async function registerInstructor(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  sport: string;
}) {
<<<<<<< HEAD
  // Obtener el rol "instructor" directamente
  const instructorRole = await db.query.role.findFirst({
    where: eq(role.name, "instructor"),
  });

  if (!instructorRole) {
    throw new Error("No existe el rol instructor en la base de datos");
  }

  // Verificar que el email no esté registrado
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, data.email),
  });

  if (existingUser) {
    throw new Error("Ya existe un usuario con este correo electrónico");
  }

  // Crear el usuario con rol de instructor
  const newUser = await db.insert(user).values({
    id: crypto.randomUUID(),
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    roleId: instructorRole.id,
  }).returning();
=======
  const instructorRole = await db.query.role.findFirst({
    where: eq(role.name, "instructor"),
    columns: { id: true },
  });

  if (!instructorRole) throw new Error("No existe el rol client");

  const newUser = await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      roleId: instructorRole.id,
      numberPhone: data.phone,
    })
    .returning();
>>>>>>> fd7731926192008c60e49c02fec1236087ef75c8

  return newUser[0];
}