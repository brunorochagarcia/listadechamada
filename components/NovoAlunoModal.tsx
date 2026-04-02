"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlunoForm } from "@/components/AlunoForm";
import { criarAluno } from "@/app/(dashboard)/alunos/actions";

type Turma = { id: string; nome: string; turno: string; anoLetivo: string };

export function NovoAlunoModal({ turmas }: { turmas: Turma[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
      >
        <Plus size={16} />
        Novo Aluno
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-800">Novo Aluno</DialogTitle>
        </DialogHeader>

        <AlunoForm
          turmas={turmas}
          action={criarAluno}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
