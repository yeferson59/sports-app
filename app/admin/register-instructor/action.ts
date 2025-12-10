"use server";

import { db } from "@/db";
import { user } from "@/auth-schema";
import { role } from "@/auth-schema";
import { eq } from "drizzle-orm";

export async function registerInstructor(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  sport: string;
}) {
  // obtener rol "client" (luego tú cambias a instructor desde la DB)
  const clientRole = await db.query.role.findFirst({
    where: eq(role.name, "client"),
  });

  if (!clientRole) throw new Error("No existe el rol client");

  const newUser = await db.insert(user).values({
    id: crypto.randomUUID(),
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    roleId: clientRole.id,
  }).returning();

  return newUser[0];
}
