"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { notificarTodos } from "@/app/(dashboard)/dashboard/actions";
import { Bell } from "lucide-react";

export function NotificarTodosButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await notificarTodos();
      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        toast.success(`${result.enviados} responsável(is) notificado(s)`);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-blue-600 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors disabled:opacity-60"
    >
      <Bell size={13} />
      {isPending ? "Enviando..." : "Alertar Responsáveis"}
    </button>
  );
}
