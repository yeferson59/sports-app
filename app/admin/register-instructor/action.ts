"use server";

import { db } from "@/db";
import { user } from "@/auth-schema";
import { getRole } from "@/lib/user";

export async function registerInstructor(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  sport: string;
}) {
  const instructorRoleId = await getRole("instructor");

  const newUser = await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      roleId: instructorRoleId,
      numberPhone: data.phone,
    })
    .returning();

  return newUser[0];
}
