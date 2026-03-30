import { prisma } from "@/lib/prisma";

export async function getAlunos(search?: string) {
  return prisma.aluno.findMany({
    where: search
      ? {
          OR: [
            { nome: { contains: search, mode: "insensitive" } },
            { matricula: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { nome: "asc" },
    include: { turma: true, _count: { select: { presencas: true } } },
  });
}

export async function getAlunoById(id: string) {
  return prisma.aluno.findUnique({
    where: { id },
    include: { turma: true },
  });
}

export async function getAlunoComPresencas(id: string) {
  return prisma.aluno.findUnique({
    where: { id },
    include: {
      turma: true,
      presencas: { orderBy: { data: "desc" } },
    },
  });
}
