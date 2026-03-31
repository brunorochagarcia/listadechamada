import { getAlunoComPresencas } from "@/lib/api/alunos";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { NextResponse } from "next/server";
import Papa from "papaparse";

const statusLabel: Record<string, string> = {
  PRESENTE: "Presente",
  AUSENTE: "Ausente",
  ATRASADO: "Atrasado",
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const aluno = await getAlunoComPresencas(id);

  if (!aluno) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }

  const { percentual } = calcularFrequencia(aluno.presencas);
  const situacao = calcularSituacao(percentual);

  const rows = aluno.presencas.map((p) => ({
    Data: new Date(p.data).toLocaleDateString("pt-BR", { timeZone: "UTC" }),
    Status: statusLabel[p.status],
  }));

  const csv = Papa.unparse({
    fields: ["Data", "Status"],
    data: rows,
  });

  const header = [
    `Aluno: ${aluno.nome}`,
    `Matrícula: ${aluno.matricula}`,
    `Turma: ${aluno.turma.nome} - ${aluno.turma.anoLetivo}`,
    `Frequência: ${percentual}%`,
    `Situação: ${situacao}`,
    "",
  ].join("\n");

  const csvFinal = header + csv;

  return new Response(csvFinal, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-${aluno.matricula}.csv"`,
    },
  });
}
