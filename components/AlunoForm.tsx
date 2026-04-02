"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
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
  status: z.enum(["ATIVO", "PENDENTE"]),
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
    status?: "ATIVO" | "PENDENTE";
  };
  action: (formData: FormData) => Promise<{ error: string } | void>;
  onCancel?: () => void;
};

export function AlunoForm({ turmas, defaultValues, action, onCancel }: Props) {
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
      status: defaultValues?.status ?? "ATIVO",
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

    formData.set("status", values.status);

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
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Foto do Aluno</label>
        <div
          className="relative w-36 cursor-pointer overflow-hidden rounded-lg bg-slate-100 hover:brightness-90 transition"
          style={{ aspectRatio: "3/4" }}
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
              <Camera size={24} className="text-slate-400" />
              <p className="text-xs text-slate-400 font-medium text-center px-2">Clique para adicionar foto</p>
            </div>
          )}
        </div>
        <input ref={fileRef} name="foto" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Nome completo <span className="text-red-500">*</span>
        </label>
        <Input {...register("nome")} placeholder="Ex: João da Silva" className="bg-white/80 backdrop-blur-sm" />
        {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Matrícula <span className="text-red-500">*</span>
        </label>
        <Input {...register("matricula")} placeholder="Ex: 2026001" className="bg-white/80 backdrop-blur-sm" />
        {errors.matricula && <p className="text-xs text-red-500 mt-1">{errors.matricula.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Turma <span className="text-red-500">*</span>
        </label>
        <Select value={turmaId} onValueChange={(v) => { if (v) setValue("turmaId", v, { shouldValidate: true }); }}>
          <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm">
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
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          E-mail do responsável <span className="text-red-500">*</span>
        </label>
        <Input {...register("emailResponsavel")} type="email" placeholder="responsavel@email.com" className="bg-white/80 backdrop-blur-sm" />
        {errors.emailResponsavel && <p className="text-xs text-red-500 mt-1">{errors.emailResponsavel.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Status
        </label>
        <div className="flex gap-3">
          {(["ATIVO", "PENDENTE"] as const).map((s) => (
            <label key={s} className="flex-1 cursor-pointer">
              <input type="radio" value={s} {...register("status")} className="sr-only peer" />
              <div className={`text-center py-2 rounded-lg border-2 text-xs font-bold transition-colors peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-checked:text-sky-700 border-slate-200 text-slate-400`}>
                {s === "ATIVO" ? "Ativo" : "Pendente"}
              </div>
            </label>
          ))}
        </div>
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
        <Button type="button" variant="outline" onClick={() => onCancel ? onCancel() : router.back()}>
          Cancelar
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        <span className="text-red-500">*</span> Campos obrigatórios
      </p>
    </form>
  );
}
