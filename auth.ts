import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "./auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, senha } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) return null;

        return { id: user.id, name: user.nome, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});