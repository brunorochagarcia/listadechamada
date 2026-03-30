"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Turma = { id: string; nome: string; anoLetivo: string };

export function FiltroPresenca({ turmas }: { turmas: Turma[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const qs = new URLSearchParams();
    for (const [k, v] of data.entries()) {
      if (v) qs.set(k, v as string);
    }
    startTransition(() => router.push(`/presencas/historico?${qs.toString()}`));
  }

  return (
    <form onChange={handleChange} className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
        <input
          name="busca"
          type="text"
          defaultValue={params.get("busca") ?? ""}
          placeholder="Nome ou matrícula..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
        <select
          name="turmaId"
          defaultValue={params.get("turmaId") ?? ""}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} — {t.anoLetivo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          defaultValue={params.get("status") ?? ""}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="PRESENTE">Presente</option>
          <option value="AUSENTE">Ausente</option>
          <option value="ATRASADO">Atrasado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">De</label>
        <input
          name="dataInicio"
          type="date"
          defaultValue={params.get("dataInicio") ?? ""}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Até</label>
        <input
          name="dataFim"
          type="date"
          defaultValue={params.get("dataFim") ?? ""}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isPending && <span className="text-sm text-gray-400 self-center">Filtrando...</span>}
    </form>
  );
}
