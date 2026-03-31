import { getAlunoComPresencas } from "@/lib/api/alunos";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { gerarRelatorioPDF } from "@/lib/export/pdf";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const aluno = await getAlunoComPresencas(id);

  if (!aluno) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }

  const { percentual } = calcularFrequencia(aluno.presencas);
  const situacao = calcularSituacao(percentual);

  const buffer = await gerarRelatorioPDF({ aluno, presencas: aluno.presencas, percentual, situacao });

  return new Response(buffer.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-${aluno.matricula}.pdf"`,
    },
  });
}
