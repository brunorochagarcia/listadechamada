"use server";

import { signIn } from "@/auth";
import { z } from "zod";
import { AuthError } from "next-auth";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});

export async function login(formData: FormData) {
  const raw = {
    email: formData.get("email"),
    senha: formData.get("senha"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      senha: parsed.data.senha,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos" };
    }
    throw error;
  }
}
