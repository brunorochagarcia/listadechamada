import { prisma } from "@/lib/prisma";
import type { StatusPresenca } from "@prisma/client";

export async function getPresencasPorTurmaEData(turmaId: string, data: Date) {
  return prisma.presenca.findMany({
    where: { turmaId, data },
    include: { aluno: true },
  });
}

type FiltrosHistorico = {
  turmaId?: string;
  status?: StatusPresenca;
  dataInicio?: Date;
  dataFim?: Date;
  busca?: string;
  page?: number;
  pageSize?: number;
};

export async function getHistoricoPresencas(filtros: FiltrosHistorico = {}) {
  const { turmaId, status, dataInicio, dataFim, busca, page = 1, pageSize = 20 } = filtros;

  const where = {
    ...(turmaId && { turmaId }),
    ...(status && { status }),
    ...(dataInicio || dataFim
      ? {
          data: {
            ...(dataInicio && { gte: dataInicio }),
            ...(dataFim && { lte: dataFim }),
          },
        }
      : {}),
    ...(busca && {
      aluno: {
        OR: [
          { nome: { contains: busca, mode: "insensitive" as const } },
          { matricula: { contains: busca, mode: "insensitive" as const } },
        ],
      },
    }),
  };

  const [total, registros] = await prisma.$transaction([
    prisma.presenca.count({ where }),
    prisma.presenca.findMany({
      where,
      orderBy: { data: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { aluno: true, turma: true },
    }),
  ]);

  return { registros, total, totalPaginas: Math.ceil(total / pageSize) };
}
