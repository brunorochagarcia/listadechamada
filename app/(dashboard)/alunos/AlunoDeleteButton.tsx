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
import { excluirAluno } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = { id: string; nome: string; presencasCount: number };

export function AlunoDeleteButton({ id, nome }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        const result = await excluirAluno(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success(`Aluno "${nome}" desativado`);
          setOpen(false);
          router.refresh();
        }
      } catch (e) {
        console.error(e);
        toast.error("Erro inesperado ao desativar aluno");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors">
        <Trash2 size={15} />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desativar aluno</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja desativar &quot;{nome}&quot;? O aluno irá para o fim da lista com status inativo. O histórico de presenças será mantido.
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
            {isPending ? "Aguarde..." : "Desativar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
