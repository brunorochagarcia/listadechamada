import { getAlunoComPresencas } from "@/lib/api/alunos";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { StatusBadge } from "@/components/StatusBadge";
import { ExportButtons } from "@/components/ExportButtons";
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
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function RelatorioAlunoPage({ params }: Props) {
  const { id } = await params;
  const aluno = await getAlunoComPresencas(id);
  if (!aluno) notFound();

  const percentual = calcularFrequencia(aluno.presencas);
  const situacao = calcularSituacao(percentual);

  return (
    <div className="space-y-6">
      <Link href="/alunos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft size={15} /> Voltar para Alunos
      </Link>

      {/* Cabeçalho do aluno */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5">
        {aluno.fotoUrl ? (
          <Image
            src={aluno.fotoUrl}
            alt={aluno.nome}
            width={72}
            height={72}
            className="rounded-full object-cover size-18 shrink-0"
          />
        ) : (
          <div className="size-18 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-400 shrink-0">
            {aluno.nome[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">{aluno.nome}</h1>
          <p className="text-sm text-gray-500">Matrícula: {aluno.matricula}</p>
          <p className="text-sm text-gray-500">Turma: {aluno.turma.nome} · {aluno.turma.anoLetivo}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-bold" style={{ color: situacao === "Regular" ? "#16a34a" : "#dc2626" }}>
            {percentual}%
          </p>
          <Badge variant={situacao === "Regular" ? "default" : "destructive"} className="mt-1">
            {situacao}
          </Badge>
          <p className="text-xs text-gray-400 mt-1">{aluno.presencas.length} registro(s)</p>
        </div>
      </div>

      <ExportButtons alunoId={id} />

      {/* Histórico de presenças */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Histórico de Presenças</h2>
        {aluno.presencas.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum registro de presença.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aluno.presencas.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {new Date(p.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
