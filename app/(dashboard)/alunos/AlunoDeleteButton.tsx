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
      toast.success(`Aluno "${nome}" desativado`);
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
      title="Desativar aluno"
      description={`Tem certeza que deseja desativar "${nome}"? O aluno irá para o fim da lista com status inativo. O histórico de presenças será mantido.`}
      confirmLabel="Desativar"
      onConfirm={handleDelete}
    />
  );
}
