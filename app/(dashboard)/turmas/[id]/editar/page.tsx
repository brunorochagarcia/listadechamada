import { getTurmaById } from "@/lib/api/turmas";
import { TurmaForm } from "@/components/TurmaForm";
import { editarTurma } from "../../actions";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditarTurmaPage({ params }: Props) {
  const { id } = await params;
  const turma = await getTurmaById(id);
  if (!turma) notFound();

  const action = editarTurma.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Turma</h1>
        <p className="text-sm text-gray-500 mt-1">Atualize os dados da turma.</p>
      </div>
      <TurmaForm
        defaultValues={{ nome: turma.nome, turno: turma.turno, anoLetivo: turma.anoLetivo }}
        action={action}
      />
    </div>
  );
}
