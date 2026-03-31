"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { enviarAlertaFrequencia } from "@/lib/email/alertaFrequencia";

const registroSchema = z.object({
  alunoId: z.string(),
  status: z.enum(["PRESENTE", "AUSENTE", "ATRASADO"]),
});

const chamadaSchema = z.object({
  turmaId: z.string().min(1, "Turma obrigatória"),
  data: z.string().min(1, "Data obrigatória"),
  registros: z.array(registroSchema),
});

export async function salvarChamada(input: {
  turmaId: string;
  data: string;
  registros: { alunoId: string; status: "PRESENTE" | "AUSENTE" | "ATRASADO" }[];
}) {
  const parsed = chamadaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { turmaId, data, registros } = parsed.data;
  const dataObj = new Date(data);

  // Upsert de cada presença (constraint unique evita duplicatas)
  await prisma.$transaction(
    registros.map(({ alunoId, status }) =>
      prisma.presenca.upsert({
        where: { alunoId_data_turmaId: { alunoId, data: dataObj, turmaId } },
        create: { alunoId, turmaId, data: dataObj, status },
        update: { status },
      })
    )
  );

  // Recalcular frequência de cada aluno e atualizar alertaEnviado
  const alunoIds = registros.map((r) => r.alunoId);
  await recalcularAlertas(alunoIds);

  revalidatePath("/presencas");
  revalidatePath("/presencas/historico");
  revalidatePath("/dashboard");
}

async function recalcularAlertas(alunoIds: string[]) {
  const alunos = await prisma.aluno.findMany({
    where: { id: { in: alunoIds } },
    include: { presencas: true, turma: true },
  });

  await Promise.all(
    alunos.map(async (aluno) => {
      const { percentual } = calcularFrequencia(aluno.presencas);
      const situacao = calcularSituacao(percentual);

      // Irregular e alerta ainda não enviado: envia e-mail e marca como enviado
      if (situacao === "Irregular" && !aluno.alertaEnviado) {
        await enviarAlertaFrequencia(aluno, percentual).catch((err) =>
          console.error(`Erro ao enviar alerta para ${aluno.emailResponsavel}:`, err)
        );
        await prisma.aluno.update({
          where: { id: aluno.id },
          data: { alertaEnviado: true },
        });
      }

      // Voltou a ser regular: reseta flag para permitir novo alerta no futuro
      if (situacao === "Regular" && aluno.alertaEnviado) {
        await prisma.aluno.update({
          where: { id: aluno.id },
          data: { alertaEnviado: false },
        });
      }
    })
  );
}
