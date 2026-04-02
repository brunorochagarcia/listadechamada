"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Turno } from "@prisma/client";

type Props = {
  defaultValues?: { nome: string; turno: Turno; anoLetivo: string };
  action: (formData: FormData) => Promise<{ error: string } | void>;
  onCancel?: () => void;
};

export function TurmaForm({ defaultValues, action, onCancel }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [turno, setTurno] = useState<string>(defaultValues?.turno ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("turno", turno);

    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Nome da turma <span className="text-red-500">*</span>
        </label>
        <Input name="nome" defaultValue={defaultValues?.nome} placeholder="Ex: 3A" required className="bg-white/80 backdrop-blur-sm" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Turno <span className="text-red-500">*</span>
        </label>
        <Select
          value={turno}
          onValueChange={(value) => { if (value) setTurno(value); }}
          required
        >
          <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm">
            <SelectValue placeholder="Selecione o turno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MANHA">Manhã</SelectItem>
            <SelectItem value="TARDE">Tarde</SelectItem>
            <SelectItem value="NOITE">Noite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Ano letivo <span className="text-red-500">*</span>
        </label>
        <Input
          name="anoLetivo"
          defaultValue={defaultValues?.anoLetivo}
          placeholder="Ex: 2026"
          required
          className="bg-white/80 backdrop-blur-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="outline" onClick={() => onCancel ? onCancel() : router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
