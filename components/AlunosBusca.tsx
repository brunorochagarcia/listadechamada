"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { AlunoDeleteButton } from "@/app/(dashboard)/alunos/AlunoDeleteButton";
import { Pencil, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Aluno = {
  id: string;
  nome: string;
  matricula: string;
  emailResponsavel: string;
  fotoUrl: string | null;
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
      <Input
        placeholder="Buscar por nome ou matrícula..."
        className="max-w-sm"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                        {aluno.fotoUrl ? (
                          <Image
                            src={aluno.fotoUrl}
                            alt={aluno.nome}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-400 font-semibold text-sm">{aluno.nome[0].toUpperCase()}</span>
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
