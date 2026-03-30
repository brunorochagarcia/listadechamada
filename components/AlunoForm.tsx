"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  matricula: z.string().min(1, "Matrícula obrigatória"),
  turmaId: z.string().min(1, "Turma obrigatória"),
  emailResponsavel: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
});

type FormValues = z.infer<typeof schema>;

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
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(defaultValues?.fotoUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: defaultValues?.nome ?? "",
      matricula: defaultValues?.matricula ?? "",
      turmaId: defaultValues?.turmaId ?? "",
      emailResponsavel: defaultValues?.emailResponsavel ?? "",
    },
  });

  const turmaId = watch("turmaId");
  const turmaLabel = turmaId
    ? turmas.find((t) => t.id === turmaId)
    : null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function onSubmit(values: FormValues) {
    setServerError(null);
    const formData = new FormData();
    formData.set("nome", values.nome);
    formData.set("matricula", values.matricula);
    formData.set("turmaId", values.turmaId);
    formData.set("emailResponsavel", values.emailResponsavel);

    const fotoFile = fileRef.current?.files?.[0];
    if (fotoFile) formData.set("foto", fotoFile);

    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setServerError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome completo <span className="text-red-500">*</span>
        </label>
        <Input {...register("nome")} placeholder="Ex: João da Silva" />
        {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Matrícula <span className="text-red-500">*</span>
        </label>
        <Input {...register("matricula")} placeholder="Ex: 2026001" />
        {errors.matricula && <p className="text-xs text-red-500 mt-1">{errors.matricula.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Turma <span className="text-red-500">*</span>
        </label>
        <Select value={turmaId} onValueChange={(v) => { if (v) setValue("turmaId", v, { shouldValidate: true }); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a turma">
              {turmaLabel ? `${turmaLabel.nome} — ${turmaLabel.anoLetivo}` : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {turmas.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nome} — {t.anoLetivo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.turmaId && <p className="text-xs text-red-500 mt-1">{errors.turmaId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          E-mail do responsável <span className="text-red-500">*</span>
        </label>
        <Input {...register("emailResponsavel")} type="email" placeholder="responsavel@email.com" />
        {errors.emailResponsavel && <p className="text-xs text-red-500 mt-1">{errors.emailResponsavel.message}</p>}
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {serverError}
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

      <p className="text-xs text-gray-400">
        <span className="text-red-500">*</span> Campos obrigatórios
      </p>
    </form>
  );
}
