"use client";

import { useState } from "react";
import Link from "next/link";
import { AlunoDeleteButton } from "@/app/(dashboard)/alunos/AlunoDeleteButton";
import { Pencil, BarChart2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Aluno = {
  id: string;
  nome: string;
  matricula: string;
  emailResponsavel: string;
  fotoUrl: string | null;
  status: "ATIVO" | "PENDENTE" | "INATIVO";
  situacao: "Regular" | "Irregular";
  turma: { nome: string; turno: "MANHA" | "TARDE" | "NOITE" };
  _count: { presencas: number };
};

export function AlunosBusca({ alunos }: { alunos: Aluno[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.matricula.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Buscar por nome ou matrícula..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full max-w-sm px-4 py-2 rounded-lg border border-white/60 bg-white/80 backdrop-blur-sm text-slate-700 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
        />
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
          {filtrados.length} {filtrados.length === 1 ? "aluno" : "alunos"}
        </span>
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          {busca ? `Nenhum aluno encontrado para "${busca}".` : "Nenhum aluno cadastrado. Crie o primeiro."}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Aluno</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Matrícula</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Turma</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Frequência</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                        {aluno.fotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={aluno.fotoUrl}
                            alt={aluno.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-500 font-bold text-base">{aluno.nome[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <Link href={`/alunos/${aluno.id}`} className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                          {aluno.nome}
                        </Link>
                        <div className="text-xs text-slate-400">{aluno.emailResponsavel}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">#{aluno.matricula}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{aluno.turma.nome}</td>
                  <td className="px-6 py-4">
                    {aluno.status === "ATIVO" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        Ativo
                      </span>
                    ) : aluno.status === "PENDENTE" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        Pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {aluno.situacao === "Regular" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={15} className="shrink-0" />
                        Regular
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                        <AlertCircle size={15} className="shrink-0" />
                        Irregular
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/alunos/${aluno.id}`} />} title="Ver relatório">
                        <BarChart2 size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/alunos/${aluno.id}/editar`} />}>
                        <Pencil size={15} />
                      </Button>
                      <AlunoDeleteButton id={aluno.id} nome={aluno.nome} presencasCount={aluno._count.presencas} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
