"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { excluirTurma } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = { id: string; nome: string };

export function TurmaDeleteButton({ id, nome }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await excluirTurma(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Turma "${nome}" excluída`);
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 size={13} />
        Excluir
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir turma</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a turma &quot;{nome}&quot;? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Aguarde..." : "Excluir"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
