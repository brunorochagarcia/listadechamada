import { getAlunos } from "@/lib/api/alunos";
import { getTurmas } from "@/lib/api/turmas";
import { AlunosBusca } from "@/components/AlunosBusca";
import { AlunoForm } from "@/components/AlunoForm";
import { criarAluno } from "./actions";

export default async function AlunosPage() {
  const [alunos, turmas] = await Promise.all([getAlunos(), getTurmas()]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Alunos</h2>
        <p className="text-sm text-slate-500 mt-1">Visualize e gerencie todos os estudantes matriculados.</p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 xl:col-span-8">
          <AlunosBusca alunos={alunos} />
        </div>

        <aside className="col-span-12 xl:col-span-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-24">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">Novo Aluno</h3>
              <p className="text-sm text-slate-500">Cadastre um novo estudante no sistema.</p>
            </div>
            <AlunoForm turmas={turmas} action={criarAluno} />
          </div>
        </aside>
      </div>
    </div>
  );
}
