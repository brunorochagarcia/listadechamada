import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, BarChart2 } from "lucide-react";
import { AlunoDeleteButton } from "@/app/(dashboard)/alunos/AlunoDeleteButton";

const turnoLabel = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite" };

type Props = {
  aluno: {
    id: string;
    nome: string;
    matricula: string;
    fotoUrl: string | null;
    turma: { nome: string; turno: "MANHA" | "TARDE" | "NOITE" };
    _count: { presencas: number };
  };
};

export function AlunoCard({ aluno }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className="shrink-0">
        {aluno.fotoUrl ? (
          <Image
            src={aluno.fotoUrl}
            alt={aluno.nome}
            width={48}
            height={48}
            className="rounded-full object-cover size-12"
          />
        ) : (
          <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg font-semibold">
            {aluno.nome[0].toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={`/alunos/${aluno.id}`} className="font-medium text-gray-900 hover:underline truncate block">
          {aluno.nome}
        </Link>
        <p className="text-sm text-gray-500">Matrícula: {aluno.matricula}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary">{aluno.turma.nome}</Badge>
          <Badge variant="outline">{turnoLabel[aluno.turma.turno]}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/alunos/${aluno.id}`} />} title="Ver relatório">
          <BarChart2 size={15} />
        </Button>
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/alunos/${aluno.id}/editar`} />}>
          <Pencil size={15} />
        </Button>
        <AlunoDeleteButton id={aluno.id} nome={aluno.nome} presencasCount={aluno._count.presencas} />
      </div>
    </div>
  );
}
