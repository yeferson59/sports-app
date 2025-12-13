"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/user";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
  rememberMe: z.coerce.boolean(),
});

export const signIn = async (formData: FormData) => {
  const { success, error, data } = await signInSchema.safeParseAsync({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe"),
  });

  if (!success) {
    console.log("Validation failed", error);
    throw new Error("Error");
  }

  const header = await headers();
  await auth.api.signInEmail({
    body: {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    },
    headers: header,
  });

  redirect("/customer");
};

const signUpSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(6).max(100),
});

export const signUp = async (formData: FormData) => {
  if (formData.get("password") !== formData.get("confirmPassword")) {
    throw new Error("Passwords do not match");
  }

  const { success, error, data } = await signUpSchema.safeParseAsync({
    name: `${formData.get("firstName")} ${formData.get("lastName")}`,
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!success) {
    console.log("Validation failed", error);
    throw new Error("Error");
  }

  const roleId = await getRole("client");

  const header = await headers();
  await auth.api.signUpEmail({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      roleId: roleId,
    },
    headers: header,
  });

  redirect("/login");
};

export const logout = async () => {
  const header = await headers();
  await auth.api.signOut({
    headers: header,
  });

  redirect("/login");
};
