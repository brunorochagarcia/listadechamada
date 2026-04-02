"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { salvarChamada } from "@/app/(dashboard)/presencas/actions";
import { Save } from "lucide-react";
import type { StatusPresenca } from "@prisma/client";

type Aluno = { id: string; nome: string; matricula: string };

type Props = {
  turmaId: string;
  turmaNome: string;
  data: string;
  alunos: Aluno[];
  presencasExistentes: Record<string, StatusPresenca>;
};

const statusOptions: { value: StatusPresenca; label: string; activeClass: string }[] = [
  { value: "PRESENTE", label: "Presente", activeClass: "bg-white shadow-sm text-green-700 font-semibold" },
  { value: "AUSENTE",  label: "Ausente",  activeClass: "bg-white shadow-sm text-red-600 font-semibold" },
  { value: "ATRASADO", label: "Atrasado", activeClass: "bg-white shadow-sm text-amber-600 font-semibold" },
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
      {/* Cabeçalho da turma */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Turma Selecionada</p>
          <h2 className="text-2xl font-bold text-gray-900">{turmaNome}</h2>
        </div>
        <div className="bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 shrink-0">
          <span className="text-blue-500">📅</span>
          <span className="font-medium text-sm text-gray-700">{dataFormatada}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <p className="text-[10px] uppercase font-bold text-green-700">Presentes</p>
          <p className="text-xl font-bold text-green-800">{presentes}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
          <p className="text-[10px] uppercase font-bold text-red-700">Ausentes</p>
          <p className="text-xl font-bold text-red-800">{ausentes}</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
          <p className="text-[10px] uppercase font-bold text-amber-700">Atrasados</p>
          <p className="text-xl font-bold text-amber-800">{atrasados}</p>
        </div>
      </div>

      {/* Busca + lista */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-600">Lista de Alunos</h3>
          <span className="text-xs text-gray-400">{alunos.length} Alunos Total</span>
        </div>

        <input
          type="text"
          placeholder="Buscar aluno por nome ou matrícula..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        />

        {alunosFiltrados.length === 0 ? (
          <p className="text-center py-10 text-gray-400">Nenhum aluno encontrado.</p>
        ) : (
          <div className="space-y-3">
            {alunosFiltrados.map((aluno, index) => (
              <div key={aluno.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-semibold shrink-0">
                    {aluno.nome[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">{aluno.nome}</p>
                    <p className="text-xs text-gray-400">Chamada #{String(index + 1).padStart(2, "0")}</p>
                  </div>
                </div>

                {/* Segmented control */}
                <div className="bg-gray-100 rounded-lg p-1 flex gap-0.5">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(aluno.id, opt.value)}
                      className={cn(
                        "flex-1 text-center py-2 text-xs rounded-md transition-all cursor-pointer",
                        registros[aluno.id] === opt.value
                          ? opt.activeClass
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button — fixed bottom */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur border-t border-gray-100 z-50">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || alunos.length === 0}
          className="w-full py-4 bg-blue-400 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500"
        >
          <Save size={18} />
          {isPending ? "Salvando..." : "Salvar Chamada"}
        </button>
      </div>
    </div>
  );
}