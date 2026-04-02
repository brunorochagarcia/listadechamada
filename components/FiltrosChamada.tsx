"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Turma = { id: string; nome: string; anoLetivo: string };

export function FiltrosChamada({ turmas }: { turmas: Turma[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const qs = new URLSearchParams();
    for (const [k, v] of data.entries()) {
      if (v) qs.set(k, v as string);
    }
    startTransition(() => router.push(`/presencas?${qs.toString()}`));
  }

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200">
      <form onChange={handleChange} className="flex flex-wrap items-end gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Turma / Grupo</label>
          <select
            name="turmaId"
            defaultValue={params.get("turmaId") ?? ""}
            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5"
          >
            <option value="">Selecione uma turma...</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} — {t.anoLetivo}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data da Chamada</label>
          <input
            name="data"
            type="date"
            defaultValue={params.get("data") ?? new Date().toISOString().split("T")[0]}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2.5"
          />
        </div>

        {isPending && <span className="text-sm text-slate-400 self-center">Carregando...</span>}
      </form>
    </div>
  );
}
