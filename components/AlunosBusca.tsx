"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlunoCard } from "@/components/AlunoCard";

type Aluno = {
  id: string;
  nome: string;
  matricula: string;
  fotoUrl: string | null;
  turma: { nome: string; turno: "MANHA" | "TARDE" | "NOITE" };
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
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por nome ou matrícula..."
          className="max-w-sm"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <span className="text-sm text-gray-500 shrink-0">
          {filtrados.length} aluno(s) encontrado(s)
        </span>
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {busca ? `Nenhum aluno encontrado para "${busca}".` : "Nenhum aluno cadastrado. Crie o primeiro."}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((aluno) => (
            <AlunoCard key={aluno.id} aluno={aluno} />
          ))}
        </div>
      )}
    </div>
  );
}
