"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { notificarAluno } from "@/app/(dashboard)/dashboard/actions";

export function NotificarButton({ id, temEmail }: { id: string; temEmail: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!temEmail) {
      toast.error("Aluno sem e-mail do responsável cadastrado.");
      return;
    }
    startTransition(async () => {
      const result = await notificarAluno(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Notificação enviada!");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || !temEmail}
      className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Enviando..." : "Notificar"}
    </button>
  );
}
