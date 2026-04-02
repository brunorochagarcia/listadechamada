import { getTurmas } from "@/lib/api/turmas";
import { getPresencasPorTurmaEData } from "@/lib/api/presencas";
import { prisma } from "@/lib/prisma";
import { PresencaForm } from "@/components/PresencaForm";
import { FiltrosChamada } from "@/components/FiltrosChamada";
import type { StatusPresenca } from "@prisma/client";

type Props = { searchParams: Promise<{ turmaId?: string; data?: string }> };

export default async function PresencasPage({ searchParams }: Props) {
  const { turmaId, data } = await searchParams;
  const turmas = await getTurmas();

  const hoje = new Date().toISOString().split("T")[0];
  const dataSelecionada = data ?? hoje;
  const turmaSelecionada = turmaId ?? "";

  let alunos: { id: string; nome: string; matricula: string }[] = [];
  let presencasExistentes: Record<string, StatusPresenca> = {};
  let turmaNome = "";

  if (turmaSelecionada) {
    const turma = turmas.find((t) => t.id === turmaSelecionada);
    turmaNome = turma?.nome ?? "";

    const [alunosResult, presencas] = await Promise.all([
      prisma.aluno.findMany({
        where: { turmaId: turmaSelecionada },
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, matricula: true },
      }),
      getPresencasPorTurmaEData(turmaSelecionada, new Date(dataSelecionada)),
    ]);
    alunos = alunosResult;
    presencasExistentes = Object.fromEntries(presencas.map((p) => [p.alunoId, p.status]));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registro de Chamada</h1>
        <p className="text-sm text-gray-500 mt-1">Selecione a turma e a data para registrar a chamada.</p>
      </div>

      <FiltrosChamada turmas={turmas} />

      {turmaSelecionada && (
        <PresencaForm
          key={`${turmaSelecionada}-${dataSelecionada}`}
          turmaId={turmaSelecionada}
          turmaNome={turmaNome}
          data={dataSelecionada}
          alunos={alunos}
          presencasExistentes={presencasExistentes}
        />
      )}
    </div>
  );
}