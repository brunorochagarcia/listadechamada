"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { salvarChamada } from "@/app/(dashboard)/presencas/actions";
import type { StatusPresenca } from "@prisma/client";

type Aluno = { id: string; nome: string; matricula: string };

type Props = {
  turmaId: string;
  data: string;
  alunos: Aluno[];
  presencasExistentes: Record<string, StatusPresenca>;
};

const statusOptions: { value: StatusPresenca; label: string; className: string }[] = [
  { value: "PRESENTE", label: "Presente", className: "border-green-500 bg-green-50 text-green-700 hover:bg-green-100" },
  { value: "AUSENTE", label: "Ausente", className: "border-red-500 bg-red-50 text-red-700 hover:bg-red-100" },
  { value: "ATRASADO", label: "Atrasado", className: "border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
];

export function PresencaForm({ turmaId, data, alunos, presencasExistentes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [busca, setBusca] = useState("");
  const [registros, setRegistros] = useState<Record<string, StatusPresenca>>(() => {
    const inicial: Record<string, StatusPresenca> = {};
    alunos.forEach((a) => {
      inicial[a.id] = presencasExistentes[a.id] ?? "PRESENTE";
    });
    return inicial;
  });

  const alunosFiltrados = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.matricula.toLowerCase().includes(busca.toLowerCase())
  );

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
    <div className="space-y-4">
      <Input
        placeholder="Buscar aluno por nome ou matrícula..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="max-w-sm"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {alunosFiltrados.length === 0 ? (
          <p className="text-center py-10 text-gray-400">Nenhum aluno encontrado.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {alunosFiltrados.map((aluno) => (
              <div key={aluno.id} className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{aluno.nome}</p>
                  <p className="text-sm text-gray-500">Mat. {aluno.matricula}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(aluno.id, opt.value)}
                      className={cn(
                        "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                        registros[aluno.id] === opt.value
                          ? opt.className
                          : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
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

      <Button onClick={handleSubmit} disabled={isPending || alunos.length === 0}>
        {isPending ? "Salvando..." : "Salvar Chamada"}
      </Button>
    </div>
  );
}
