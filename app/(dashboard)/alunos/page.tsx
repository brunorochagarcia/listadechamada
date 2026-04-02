import { getAlunos } from "@/lib/api/alunos";
import { getTurmas } from "@/lib/api/turmas";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { AlunosBusca } from "@/components/AlunosBusca";
import { NovoAlunoModal } from "@/components/NovoAlunoModal";

export default async function AlunosPage() {
  const [alunos, turmas] = await Promise.all([getAlunos(), getTurmas()]);

  const statusOrder = { ATIVO: 0, PENDENTE: 1, INATIVO: 2 };

  const alunosComSituacao = alunos
    .map((a) => ({
      ...a,
      situacao: calcularSituacao(calcularFrequencia(a.presencas).percentual),
    }))
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Gestão de Alunos</h2>
          <p className="text-sm text-slate-500 mt-1">Visualize e gerencie todos os estudantes matriculados.</p>
        </div>
        <NovoAlunoModal turmas={turmas} />
      </div>

      <AlunosBusca alunos={alunosComSituacao} />
    </div>
  );
}
