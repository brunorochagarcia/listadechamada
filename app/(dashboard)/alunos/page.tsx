import { getAlunos } from "@/lib/api/alunos";
import { AlunosBusca } from "@/components/AlunosBusca";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AlunosPage() {
  const alunos = await getAlunos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
          <p className="text-sm text-gray-500 mt-1">{alunos.length} aluno(s) no total</p>
        </div>
        <Button render={<Link href="/alunos/novo" />} nativeButton={false}>
          <Plus size={16} />
          Novo Aluno
        </Button>
      </div>

      <AlunosBusca alunos={alunos} />
    </div>
  );
}
