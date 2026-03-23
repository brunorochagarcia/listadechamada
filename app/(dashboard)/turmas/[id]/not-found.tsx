import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TurmaNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <h2 className="text-xl font-semibold text-gray-900">Turma não encontrada</h2>
      <p className="text-sm text-gray-500">A turma que você está procurando não existe ou foi removida.</p>
      <Button variant="outline" nativeButton={false} render={<Link href="/turmas" />}>
        Voltar para Turmas
      </Button>
    </div>
  );
}
