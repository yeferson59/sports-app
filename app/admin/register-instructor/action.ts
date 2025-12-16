"use server";

import { getRole } from "@/lib/user";
import { auth } from "@/auth";

export async function registerInstructor(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  sport: string;
}) {
  const instructorRole = await getRole("instructor");

  await auth.api.signUpEmail({
    body: {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      roleId: instructorRole,
      password: data.password,
      numberPhone: data.phone,
    },
  });
}
