import { prisma } from "@/lib/prisma";
import { calcularFrequencia } from "@/lib/utils/frequencia";
import { gerarIrregularesPDF } from "@/lib/export/pdfIrregulares";
import { NextResponse } from "next/server";

export async function GET() {
  const alunos = await prisma.aluno.findMany({
    include: { presencas: true, turma: true },
    orderBy: { nome: "asc" },
  });

  const irregulares = alunos
    .map((a) => ({
      nome: a.nome,
      matricula: a.matricula,
      turma: a.turma.nome,
      percentual: calcularFrequencia(a.presencas).percentual,
    }))
    .filter((a) => a.percentual < 75);

  const buffer = await gerarIrregularesPDF(irregulares);

  return new Response(buffer.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="irregulares.pdf"`,
    },
  });
}
