"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { salvarChamada } from "@/app/(dashboard)/presencas/actions";
import { Save, CheckCircle, XCircle, Clock } from "lucide-react";
import type { StatusPresenca } from "@prisma/client";

type Aluno = { id: string; nome: string; matricula: string };

type Props = {
  turmaId: string;
  turmaNome: string;
  data: string;
  alunos: Aluno[];
  presencasExistentes: Record<string, StatusPresenca>;
};

const statusOptions = [
  { value: "PRESENTE" as StatusPresenca, label: "Presente", Icon: CheckCircle, activeClass: "bg-white text-green-700 shadow-sm border border-green-100 font-semibold" },
  { value: "AUSENTE"  as StatusPresenca, label: "Ausente",  Icon: XCircle,     activeClass: "bg-white text-red-600 shadow-sm border border-red-100 font-semibold" },
  { value: "ATRASADO" as StatusPresenca, label: "Atrasado", Icon: Clock,        activeClass: "bg-white text-amber-600 shadow-sm border border-amber-100 font-semibold" },
];

export function PresencaForm({ turmaId, turmaNome, data, alunos, presencasExistentes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [busca, setBusca] = useState("");
  const [registros, setRegistros] = useState<Record<string, StatusPresenca>>(() => {
    const inicial: Record<string, StatusPresenca> = {};
    alunos.forEach((a) => {
      inicial[a.id] = presencasExistentes[a.id] ?? "PRESENTE";
    });
    return inicial;
  });

  const dataFormatada = new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const alunosFiltrados = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.matricula.toLowerCase().includes(busca.toLowerCase())
  );

  const presentes  = Object.values(registros).filter((s) => s === "PRESENTE").length;
  const ausentes   = Object.values(registros).filter((s) => s === "AUSENTE").length;
  const atrasados  = Object.values(registros).filter((s) => s === "ATRASADO").length;

  function setStatus(alunoId: string, status: StatusPresenca) {
    setRegistros((prev) => ({ ...prev, [alunoId]: status }));
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await salvarChamada({
        turmaId,
        data,
        registros: Object.entries(registros).map(([alunoId, status]) => ({ alunoId, status })),
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Chamada salva com sucesso!");
      }
    });
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Resumo da turma + stats */}
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Turma Selecionada</p>
          <h2 className="text-xl font-bold text-slate-800">{turmaNome}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{dataFormatada}</p>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <div className="text-center">
            <p className="text-[10px] text-blue-600 font-bold uppercase">Total</p>
            <p className="text-xl font-bold text-slate-800">{alunos.length}</p>
          </div>
          <div className="w-px h-8 bg-blue-200 mx-1" />
          <div className="text-center">
            <p className="text-[10px] text-green-600 font-bold uppercase">Presentes</p>
            <p className="text-xl font-bold text-slate-800">{presentes}</p>
          </div>
          <div className="w-px h-8 bg-blue-200 mx-1" />
          <div className="text-center">
            <p className="text-[10px] text-red-600 font-bold uppercase">Ausentes</p>
            <p className="text-xl font-bold text-slate-800">{ausentes}</p>
          </div>
          <div className="w-px h-8 bg-blue-200 mx-1" />
          <div className="text-center">
            <p className="text-[10px] text-amber-600 font-bold uppercase">Atrasados</p>
            <p className="text-xl font-bold text-slate-800">{atrasados}</p>
          </div>
        </div>
      </div>

      {/* Tabela de alunos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <input
            type="text"
            placeholder="Buscar aluno por nome ou matrícula..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full max-w-sm px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
        </div>

        {alunosFiltrados.length === 0 ? (
          <p className="text-center py-10 text-slate-400">Nenhum aluno encontrado.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Matrícula</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status de Presença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alunosFiltrados.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-semibold shrink-0">
                        {aluno.nome[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{aluno.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{aluno.matricula}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
                        {statusOptions.map(({ value, label, Icon, activeClass }) => {
                          const isActive = registros[aluno.id] === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setStatus(aluno.id, value)}
                              className={cn(
                                "px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                                isActive ? activeClass : "text-slate-500 hover:text-slate-700"
                              )}
                            >
                              {isActive && <Icon size={12} className="shrink-0" />}
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Floating footer */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur border-t border-slate-100 z-50 flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-bold text-slate-700">{presentes}/{alunos.length} Presentes</span>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || alunos.length === 0}
          className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-full font-black text-sm uppercase tracking-wide hover:bg-blue-700 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {isPending ? "Salvando..." : "Finalizar Chamada"}
        </button>
      </div>
    </div>
  );
}
