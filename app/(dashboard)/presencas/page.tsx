import { getTurmas } from "@/lib/api/turmas";
import { getPresencasPorTurmaEData } from "@/lib/api/presencas";
import { prisma } from "@/lib/prisma";
import { PresencaForm } from "@/components/PresencaForm";
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

  if (turmaSelecionada) {
    alunos = await prisma.aluno.findMany({
      where: { turmaId: turmaSelecionada },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, matricula: true },
    });

    const presencas = await getPresencasPorTurmaEData(turmaSelecionada, new Date(dataSelecionada));
    presencasExistentes = Object.fromEntries(presencas.map((p) => [p.alunoId, p.status]));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registro de Chamada</h1>
        <p className="text-sm text-gray-500 mt-1">Selecione a turma e a data para registrar a chamada.</p>
      </div>

      {/* Seleção de turma e data via GET */}
      <form method="GET" className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
          <select
            name="turmaId"
            defaultValue={turmaSelecionada}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} — {t.anoLetivo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input
            name="data"
            type="date"
            defaultValue={dataSelecionada}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          Carregar
        </button>
      </form>

      {turmaSelecionada && (
        <PresencaForm
          turmaId={turmaSelecionada}
          data={dataSelecionada}
          alunos={alunos}
          presencasExistentes={presencasExistentes}
        />
      )}
    </div>
  );
}
