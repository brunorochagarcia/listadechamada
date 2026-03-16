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
