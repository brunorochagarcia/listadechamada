"use server";

import { prisma } from "@/lib/prisma";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
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

export async function notificarTodos() {
  const alunos = await prisma.aluno.findMany({
    where: { emailResponsavel: { not: "" } },
    include: { presencas: true, turma: true },
  });

  const irregulares = alunos.filter(
    (a) => calcularSituacao(calcularFrequencia(a.presencas).percentual) === "Irregular"
  );

  if (irregulares.length === 0) return { enviados: 0 };

  let enviados = 0;
  for (const aluno of irregulares) {
    try {
      const { percentual } = calcularFrequencia(aluno.presencas);
      await enviarAlertaFrequencia(aluno, percentual);
      await prisma.aluno.update({ where: { id: aluno.id }, data: { alertaEnviado: true } });
      enviados++;
    } catch {
      // continua para os próximos
    }
  }

  revalidatePath("/dashboard");
  return { enviados };
}
