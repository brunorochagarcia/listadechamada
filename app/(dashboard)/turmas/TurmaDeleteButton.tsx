"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { excluirTurma } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = { id: string; nome: string };

export function TurmaDeleteButton({ id, nome }: Props) {
  const router = useRouter();

  async function handleDelete() {
    const result = await excluirTurma(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Turma "${nome}" excluída`);
      router.refresh();
    }
  }

  return (
    <ConfirmModal
      trigger={
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
          <Trash2 size={15} />
        </Button>
      }
      title="Excluir turma"
      description={`Tem certeza que deseja excluir a turma "${nome}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir"
      onConfirm={handleDelete}
    />
  );
}
