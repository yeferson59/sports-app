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

  return newUser[0];
}
