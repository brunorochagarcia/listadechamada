import { z } from "zod";

const envSchema = z.object({
  // Banco de dados
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET é obrigatória"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL deve ser uma URL válida"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME é obrigatória"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY é obrigatória"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET é obrigatória"),

  // Resend
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY é obrigatória"),
  RESEND_FROM_EMAIL: z.string().email("RESEND_FROM_EMAIL deve ser um e-mail válido"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Variáveis de ambiente inválidas. Verifique o arquivo .env");
}

export const env = parsed.data;
