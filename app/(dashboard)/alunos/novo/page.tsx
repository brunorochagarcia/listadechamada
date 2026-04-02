import { getTurmas } from "@/lib/api/turmas";
import { AlunoForm } from "@/components/AlunoForm";
import { criarAluno } from "../actions";

export default async function NovoAlunoPage() {
  const turmas = await getTurmas();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Novo Aluno</h1>
        <p className="text-sm text-slate-500 mt-1">Preencha os dados para cadastrar um novo aluno.</p>
      </div>
      <AlunoForm turmas={turmas} action={criarAluno} />
    </div>
  );
}
