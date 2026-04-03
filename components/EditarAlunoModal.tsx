"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlunoForm } from "@/components/AlunoForm";
import { editarAluno } from "@/app/(dashboard)/alunos/actions";

type Turma = { id: string; nome: string; turno: string; anoLetivo: string };

type Props = {
  aluno: {
    id: string;
    nome: string;
    matricula: string;
    turmaId: string;
    emailResponsavel: string;
    fotoUrl: string | null;
    status: "ATIVO" | "PENDENTE" | "INATIVO";
  };
  turmas: Turma[];
};

export function EditarAlunoModal({ aluno, turmas }: Props) {
  const [open, setOpen] = useState(false);
  const action = editarAluno.bind(null, aluno.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
        <Pencil size={15} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-800">Editar Aluno</DialogTitle>
        </DialogHeader>

        <AlunoForm
          turmas={turmas}
          defaultValues={{
            nome: aluno.nome,
            matricula: aluno.matricula,
            turmaId: aluno.turmaId,
            emailResponsavel: aluno.emailResponsavel,
            fotoUrl: aluno.fotoUrl,
            status: aluno.status === "INATIVO" ? "ATIVO" : aluno.status,
          }}
          action={action}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}