"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { Camera } from "lucide-react";

type Turma = { id: string; nome: string; turno: string; anoLetivo: string };

type Props = {
  turmas: Turma[];
  defaultValues?: {
    nome: string;
    matricula: string;
    turmaId: string;
    emailResponsavel: string;
    fotoUrl?: string | null;
  };
  action: (formData: FormData) => Promise<{ error: string } | void>;
};

export function AlunoForm({ turmas, defaultValues, action }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [turmaId, setTurmaId] = useState(defaultValues?.turmaId ?? "");
  const [preview, setPreview] = useState<string | null>(defaultValues?.fotoUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("turmaId", turmaId);

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
      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Foto (opcional)</label>
        <div className="flex items-center gap-4">
          <div
            className="size-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <Image src={preview} alt="Preview" width={64} height={64} className="object-cover size-full" />
            ) : (
              <Camera size={20} className="text-gray-400" />
            )}
          </div>
          <div>
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              {preview ? "Trocar foto" : "Selecionar foto"}
            </Button>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WEBP</p>
          </div>
        </div>
        <input ref={fileRef} name="foto" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
        <Input name="nome" defaultValue={defaultValues?.nome} placeholder="Ex: João da Silva" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
        <Input name="matricula" defaultValue={defaultValues?.matricula} placeholder="Ex: 2026001" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
        <Select value={turmaId} onValueChange={(v) => { if (v) setTurmaId(v); }} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a turma" />
          </SelectTrigger>
          <SelectContent>
            {turmas.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nome} — {t.anoLetivo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do responsável</label>
        <Input name="emailResponsavel" type="email" defaultValue={defaultValues?.emailResponsavel} placeholder="responsavel@email.com" required />
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
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
