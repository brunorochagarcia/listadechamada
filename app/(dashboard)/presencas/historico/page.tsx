import { getHistoricoPresencas } from "@/lib/api/presencas";
import { getTurmas } from "@/lib/api/turmas";
import { FiltroPresenca } from "@/components/FiltroPresenca";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StatusPresenca } from "@prisma/client";

type Props = {
  searchParams: Promise<{
    turmaId?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
    page?: string;
  }>;
};

export default async function HistoricoPage({ searchParams }: Props) {
  const { turmaId, status, dataInicio, dataFim, page } = await searchParams;
  const currentPage = Number(page ?? 1);

  const [turmas, { registros, total, totalPaginas }] = await Promise.all([
    getTurmas(),
    getHistoricoPresencas({
      turmaId,
      status: status as StatusPresenca | undefined,
      dataInicio: dataInicio ? new Date(dataInicio) : undefined,
      dataFim: dataFim ? new Date(dataFim) : undefined,
      page: currentPage,
      pageSize: 20,
    }),
  ]);

  function pageUrl(p: number) {
    const qs = new URLSearchParams({
      ...(turmaId && { turmaId }),
      ...(status && { status }),
      ...(dataInicio && { dataInicio }),
      ...(dataFim && { dataFim }),
      page: String(p),
    });
    return `/presencas/historico?${qs.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Presenças</h1>
        <p className="text-sm text-gray-500 mt-1">{total} registro(s) encontrado(s)</p>
      </div>

      <FiltroPresenca turmas={turmas} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              registros.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.aluno.nome}</TableCell>
                  <TableCell>{r.turma.nome}</TableCell>
                  <TableCell>{new Date(r.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" render={<Link href={pageUrl(currentPage - 1)} />} disabled={currentPage <= 1}>
            Anterior
          </Button>
          <span className="text-sm text-gray-500">
            Página {currentPage} de {totalPaginas}
          </span>
          <Button variant="outline" size="sm" render={<Link href={pageUrl(currentPage + 1)} />} disabled={currentPage >= totalPaginas}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
