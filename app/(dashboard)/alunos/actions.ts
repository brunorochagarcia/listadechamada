"use server";

import { prisma } from "@/lib/prisma";
import { uploadFoto, deleteFoto, MAX_FOTO_SIZE } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const alunoSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  matricula: z.string().min(1, "Matrícula obrigatória"),
  turmaId: z.string().min(1, "Turma obrigatória"),
  emailResponsavel: z.string().email("E-mail do responsável inválido"),
});

export async function criarAluno(formData: FormData) {
  const parsed = alunoSchema.safeParse({
    nome: formData.get("nome"),
    matricula: formData.get("matricula"),
    turmaId: formData.get("turmaId"),
    emailResponsavel: formData.get("emailResponsavel"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const fotoFile = formData.get("foto") as File | null;
  let fotoUrl: string | undefined;
  let fotoPublicId: string | undefined;

  if (fotoFile && fotoFile.size > MAX_FOTO_SIZE) {
    return { error: "Imagem muito grande, escolha uma menor" };
  }

  if (fotoFile && fotoFile.size > 0) {
    try {
      const result = await uploadFoto(fotoFile);
      fotoUrl = result.url;
      fotoPublicId = result.publicId;
    } catch (e) {
      console.error("[criarAluno] Erro no upload da foto:", e);
      return { error: "Erro ao fazer upload da foto" };
    }
  }

  try {
    await prisma.aluno.create({
      data: { ...parsed.data, fotoUrl, fotoPublicId },
    });
  } catch (e: unknown) {
    if (fotoPublicId) await deleteFoto(fotoPublicId).catch(() => null);
    if (isUniqueConstraintError(e)) {
      return { error: "Já existe um aluno com essa matrícula" };
    }
    throw e;
  }

  revalidatePath("/alunos");
  redirect("/alunos");
}

export async function editarAluno(id: string, formData: FormData) {
  const parsed = alunoSchema.safeParse({
    nome: formData.get("nome"),
    matricula: formData.get("matricula"),
    turmaId: formData.get("turmaId"),
    emailResponsavel: formData.get("emailResponsavel"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const aluno = await prisma.aluno.findUnique({ where: { id } });
  if (!aluno) return { error: "Aluno não encontrado" };

  const fotoFile = formData.get("foto") as File | null;
  let fotoUrl = aluno.fotoUrl ?? undefined;
  let fotoPublicId = aluno.fotoPublicId ?? undefined;

  if (fotoFile && fotoFile.size > MAX_FOTO_SIZE) {
    return { error: "Imagem muito grande, escolha uma menor" };
  }

  if (fotoFile && fotoFile.size > 0) {
    try {
      // Remove foto anterior antes de fazer upload da nova
      if (aluno.fotoPublicId) await deleteFoto(aluno.fotoPublicId).catch(() => null);
      const result = await uploadFoto(fotoFile);
      fotoUrl = result.url;
      fotoPublicId = result.publicId;
    } catch (e) {
      console.error("[editarAluno] Erro no upload da foto:", e);
      return { error: "Erro ao fazer upload da foto" };
    }
  }

  try {
    await prisma.aluno.update({
      where: { id },
      data: { ...parsed.data, fotoUrl, fotoPublicId },
    });
  } catch (e: unknown) {
    if (isUniqueConstraintError(e)) {
      return { error: "Já existe um aluno com essa matrícula" };
    }
    throw e;
  }

  revalidatePath("/alunos");
  redirect("/alunos");
}

export async function excluirAluno(id: string) {
  const aluno = await prisma.aluno.findUnique({ where: { id } });
  if (!aluno) return { error: "Aluno não encontrado" };

  if (aluno.fotoPublicId) await deleteFoto(aluno.fotoPublicId).catch(() => null);

  await prisma.aluno.delete({ where: { id } });
  revalidatePath("/alunos");
}

function isUniqueConstraintError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2002"
  );
}
