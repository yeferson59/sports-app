import { user, role } from "@/auth-schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export const getUserRole = async (id?: string) => {
  if (!id) return null;

  const userData = await db.query.user.findFirst({
    where: eq(user.id, id),
  });
  if (!userData) return null;

  const roleName = await db.query.role.findFirst({
    where: eq(role.id, userData.roleId),
    columns: { name: true },
  });

  if (!roleName) return null;

  return roleName.name;
};

export const isAdmin = async (id?: string) => {
  const role = await getUserRole(id);
  return role === "admin";
};

export const isClient = async (id?: string) => {
  const role = await getUserRole(id);
  return role === "client";
};

export const isInstructor = async (id?: string) => {
  const role = await getUserRole(id);
  return role === "instructor";
};
