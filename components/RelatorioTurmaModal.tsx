"use client";

import { useState } from "react";
import { BarChart2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buscarRelatorioTurma } from "@/app/(dashboard)/turmas/actions";

const turnoLabel: Record<string, string> = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite" };

type Relatorio = Awaited<ReturnType<typeof buscarRelatorioTurma>>;

type Props = { turmaId: string; turmaNome: string };

export function RelatorioTurmaModal({ turmaId, turmaNome }: Props) {
  const [open, setOpen] = useState(false);
  const [relatorio, setRelatorio] = useState<Relatorio>(null);
  const [loading, setLoading] = useState(false);

  async function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && !relatorio) {
      setLoading(true);
      const data = await buscarRelatorioTurma(turmaId);
      setRelatorio(data);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
        <BarChart2 size={14} />
        Relatório
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-800">
            Relatório — Turma {turmaNome}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Carregando...</div>
        ) : !relatorio ? (
          <div className="py-12 text-center text-slate-400 text-sm">Sem dados.</div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              {turnoLabel[relatorio.turno]} · {relatorio.anoLetivo} · {relatorio.alunos.length} aluno(s) · últimos 30 dias
            </p>

            {relatorio.alunos.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum aluno nesta turma.</p>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Pres.</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Atr.</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aus.</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Freq.</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Situação</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Último reg.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relatorio.alunos.map((aluno) => (
                      <tr key={aluno.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/alunos/${aluno.id}`}
                            className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            {aluno.nome}
                          </Link>
                          <p className="text-xs text-slate-400">{aluno.matricula}</p>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">{aluno.presentes}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{aluno.atrasados}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{aluno.ausentes}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700">{aluno.percentual}%</td>
                        <td className="px-4 py-3 text-center">
                          {aluno.situacao === "Regular" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                              <CheckCircle2 size={13} />Regular
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                              <AlertCircle size={13} />Irregular
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {aluno.ultimaData ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
