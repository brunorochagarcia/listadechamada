import { getAlunos } from "@/lib/api/alunos";
import { AlunoCard } from "@/components/AlunoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus } from "lucide-react";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AlunosPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const alunos = await getAlunos(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
          <p className="text-sm text-gray-500 mt-1">{alunos.length} aluno(s) encontrado(s)</p>
        </div>
        <Button render={<Link href="/alunos/novo" />}>
          <Plus size={16} />
          Novo Aluno
        </Button>
      </div>

      <form method="GET">
        <Input name="q" defaultValue={q} placeholder="Buscar por nome ou matrícula..." className="max-w-sm" />
      </form>

      {alunos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {q ? `Nenhum aluno encontrado para "${q}".` : "Nenhum aluno cadastrado. Crie o primeiro."}
        </div>
      ) : (
        <div className="grid gap-3">
          {alunos.map((aluno) => (
            <AlunoCard key={aluno.id} aluno={aluno} />
          ))}
        </div>
      )}
    </div>
  );
}
