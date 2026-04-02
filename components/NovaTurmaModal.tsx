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
import { TurmaForm } from "@/components/TurmaForm";
import { criarTurma } from "@/app/(dashboard)/turmas/actions";

export function NovaTurmaModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
      >
        <Plus size={16} />
        Nova Turma
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-800">Nova Turma</DialogTitle>
        </DialogHeader>

        <TurmaForm
          action={criarTurma}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
