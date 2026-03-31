import { getTurmaComRelatorio } from "@/lib/api/turmas";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const turnoLabel = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite" };

type Props = { params: Promise<{ id: string }> };

export default async function TurmaRelatorioPage({ params }: Props) {
  const { id } = await params;
  const turma = await getTurmaComRelatorio(id);
  if (!turma) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/turmas"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={15} /> Voltar para Turmas
      </Link>

      {/* Cabeçalho */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900">
          Turma {turma.nome}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {turnoLabel[turma.turno]} · {turma.anoLetivo} ·{" "}
          {turma.alunos.length} aluno(s)
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Últimos 30 dias
        </p>
      </div>

      {/* Tabela de alunos */}
      {turma.alunos.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum aluno nesta turma.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead className="text-center">Presentes</TableHead>
                <TableHead className="text-center">Atrasados</TableHead>
                <TableHead className="text-center">Ausentes</TableHead>
                <TableHead className="text-center">Frequência</TableHead>
                <TableHead className="text-center">Situação</TableHead>
                <TableHead>Último registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turma.alunos.map((aluno) => {
                const { percentual, presentes, atrasados, ausentes } = calcularFrequencia(aluno.presencas);
                const situacao = calcularSituacao(percentual);
                const ultimo = aluno.presencas[0];

                return (
                  <TableRow key={aluno.id}>
                    <TableCell>
                      <Link
                        href={`/alunos/${aluno.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {aluno.nome}
                      </Link>
                      <p className="text-xs text-gray-400">{aluno.matricula}</p>
                    </TableCell>
                    <TableCell className="text-center">{presentes}</TableCell>
                    <TableCell className="text-center">{atrasados}</TableCell>
                    <TableCell className="text-center">{ausentes}</TableCell>
                    <TableCell className="text-center font-semibold">
                      {percentual}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          situacao === "Regular" ? "default" : "destructive"
                        }
                      >
                        {situacao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ultimo ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {new Date(ultimo.data).toLocaleDateString("pt-BR", {
                              timeZone: "UTC",
                            })}
                          </span>
                          <StatusBadge status={ultimo.status} />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
