"use server";

import { prisma } from "@/lib/prisma";
import { calcularFrequencia } from "@/lib/utils/frequencia";
import { enviarAlertaFrequencia } from "@/lib/email/alertaFrequencia";
import { revalidatePath } from "next/cache";

export async function notificarAluno(id: string) {
  const aluno = await prisma.aluno.findUnique({
    where: { id },
    include: { presencas: true, turma: true },
  });

  if (!aluno) return { error: "Aluno não encontrado" };
  if (!aluno.emailResponsavel) return { error: "Aluno sem e-mail do responsável" };

  const { percentual } = calcularFrequencia(aluno.presencas);

  await enviarAlertaFrequencia(aluno, percentual);

  await prisma.aluno.update({
    where: { id },
    data: { alertaEnviado: true },
  });

  revalidatePath("/dashboard");
}
