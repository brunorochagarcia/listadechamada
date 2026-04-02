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
      className="bg-blue-400 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
    >
      {isPending ? "Enviando..." : "Notificar"}
    </button>
  );
}