import { getAlunoById } from "@/lib/api/alunos";
import { getTurmas } from "@/lib/api/turmas";
import { AlunoForm } from "@/components/AlunoForm";
import { editarAluno } from "../../actions";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditarAlunoPage({ params }: Props) {
  const { id } = await params;
  const [aluno, turmas] = await Promise.all([getAlunoById(id), getTurmas()]);
  if (!aluno) notFound();

  const action = editarAluno.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Aluno</h1>
        <p className="text-sm text-gray-500 mt-1">Atualize os dados do aluno.</p>
      </div>
      <AlunoForm
        turmas={turmas}
        defaultValues={{
          nome: aluno.nome,
          matricula: aluno.matricula,
          turmaId: aluno.turmaId,
          emailResponsavel: aluno.emailResponsavel,
          fotoUrl: aluno.fotoUrl,
        }}
        action={action}
      />
    </div>
  );
}
