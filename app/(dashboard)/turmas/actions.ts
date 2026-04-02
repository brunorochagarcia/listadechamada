"use server";

import { prisma } from "@/lib/prisma";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function buscarRelatorioTurma(id: string) {
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 30);
  inicio.setHours(0, 0, 0, 0);

  const turma = await prisma.turma.findUnique({
    where: { id },
    include: {
      alunos: {
        orderBy: { nome: "asc" },
        include: {
          presencas: {
            where: { data: { gte: inicio } },
            orderBy: { data: "desc" },
          },
        },
      },
    },
  });

  if (!turma) return null;

  return {
    id: turma.id,
    nome: turma.nome,
    turno: turma.turno,
    anoLetivo: turma.anoLetivo,
    alunos: turma.alunos.map((a) => {
      const { percentual, presentes, atrasados, ausentes } = calcularFrequencia(a.presencas);
      const ultimo = a.presencas[0];
      return {
        id: a.id,
        nome: a.nome,
        matricula: a.matricula,
        percentual,
        presentes,
        atrasados,
        ausentes,
        situacao: calcularSituacao(percentual),
        ultimaData: ultimo ? new Date(ultimo.data).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : null,
        ultimoStatus: ultimo?.status ?? null,
      };
    }),
  };
}

const turmaSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  turno: z.enum(["MANHA", "TARDE", "NOITE"], { error: "Turno inválido" }),
  anoLetivo: z.string().min(4, "Ano letivo obrigatório"),
});

export async function criarTurma(formData: FormData) {
  const parsed = turmaSchema.safeParse({
    nome: formData.get("nome"),
    turno: formData.get("turno"),
    anoLetivo: formData.get("anoLetivo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.turma.create({ data: parsed.data });
  revalidatePath("/turmas");
  redirect("/turmas");
}

export async function editarTurma(id: string, formData: FormData) {
  const parsed = turmaSchema.safeParse({
    nome: formData.get("nome"),
    turno: formData.get("turno"),
    anoLetivo: formData.get("anoLetivo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.turma.update({ where: { id }, data: parsed.data });
  revalidatePath("/turmas");
  redirect("/turmas");
}

export async function excluirTurma(id: string) {
  const turma = await prisma.turma.findUnique({
    where: { id },
    include: { _count: { select: { alunos: true } } },
  });

  if (!turma) return { error: "Turma não encontrada" };

  if (turma._count.alunos > 0) {
    return { error: "Não é possível excluir uma turma com alunos vinculados" };
  }

  await prisma.turma.delete({ where: { id } });
  revalidatePath("/turmas");
}
