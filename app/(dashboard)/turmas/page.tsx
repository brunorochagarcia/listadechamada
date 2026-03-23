import Link from "next/link";
import { getTurmas } from "@/lib/api/turmas";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, BarChart2 } from "lucide-react";
import { TurmaDeleteButton } from "./TurmaDeleteButton";

const turnoLabel = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite" };

export default async function TurmasPage() {
  const turmas = await getTurmas();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
          <p className="text-sm text-gray-500 mt-1">{turmas.length} turma(s) cadastrada(s)</p>
        </div>
        <Button nativeButton={false} render={<Link href="/turmas/nova" />}>
          <Plus size={16} />
          Nova Turma
        </Button>
      </div>

      {turmas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          Nenhuma turma cadastrada. Crie a primeira.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Ano Letivo</TableHead>
                <TableHead className="text-center">Alunos</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {turmas.map((turma) => (
                <TableRow key={turma.id}>
                  <TableCell className="font-medium">{turma.nome}</TableCell>
                  <TableCell>{turnoLabel[turma.turno]}</TableCell>
                  <TableCell>{turma.anoLetivo}</TableCell>
                  <TableCell className="text-center">{turma._count.alunos}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/turmas/${turma.id}`} />} title="Ver relatório">
                        <BarChart2 size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/turmas/${turma.id}/editar`} />}>
                        <Pencil size={15} />
                      </Button>
                      <TurmaDeleteButton id={turma.id} nome={turma.nome} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
