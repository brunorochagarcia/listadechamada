import { TurmaForm } from "@/components/TurmaForm";
import { criarTurma } from "../actions";

export default function NovaTurmaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Turma</h1>
        <p className="text-sm text-gray-500 mt-1">Preencha os dados para criar uma nova turma.</p>
      </div>
      <TurmaForm action={criarTurma} />
    </div>
  );
}
