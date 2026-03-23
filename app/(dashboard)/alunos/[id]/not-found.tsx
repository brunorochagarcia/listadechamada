import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AlunoNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <h2 className="text-xl font-semibold text-gray-900">Aluno não encontrado</h2>
      <p className="text-sm text-gray-500">O aluno que você está procurando não existe ou foi removido.</p>
      <Button variant="outline" nativeButton={false} render={<Link href="/alunos" />}>
        Voltar para Alunos
      </Button>
    </div>
  );
}
