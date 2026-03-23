import { prisma } from "@/lib/prisma";

export async function getTurmas() {
  return prisma.turma.findMany({
    orderBy: [{ anoLetivo: "desc" }, { nome: "asc" }],
    include: { _count: { select: { alunos: true } } },
  });
}

export async function getTurmaById(id: string) {
  return prisma.turma.findUnique({
    where: { id },
    include: { _count: { select: { alunos: true } } },
  });
}

export async function getTurmaComRelatorio(id: string) {
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 30);
  inicio.setHours(0, 0, 0, 0);

  return prisma.turma.findUnique({
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
}
