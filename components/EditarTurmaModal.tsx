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
import { TurmaForm } from "@/components/TurmaForm";
import { editarTurma } from "@/app/(dashboard)/turmas/actions";
import type { Turno } from "@prisma/client";

type Props = {
  turma: { id: string; nome: string; turno: Turno; anoLetivo: string };
};

export function EditarTurmaModal({ turma }: Props) {
  const [open, setOpen] = useState(false);
  const action = editarTurma.bind(null, turma.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
        <Pencil size={14} />
        Editar
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-800">Editar Turma</DialogTitle>
        </DialogHeader>

        <TurmaForm
          defaultValues={{ nome: turma.nome, turno: turma.turno, anoLetivo: turma.anoLetivo }}
          action={action}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
