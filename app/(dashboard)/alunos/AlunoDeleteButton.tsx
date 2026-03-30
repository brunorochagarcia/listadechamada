"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { excluirAluno } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = { id: string; nome: string; presencasCount: number };

export function AlunoDeleteButton({ id, nome, presencasCount }: Props) {
  const router = useRouter();

  async function handleDelete() {
    const result = await excluirAluno(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Aluno "${nome}" excluído`);
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
      title="Excluir aluno"
      description={
        presencasCount > 0
          ? `Atenção: "${nome}" possui ${presencasCount} registro(s) de presença. Ao excluir, todo o histórico será perdido permanentemente.`
          : `Tem certeza que deseja excluir "${nome}"?`
      }
      confirmLabel="Excluir"
      onConfirm={handleDelete}
    />
  );
}
