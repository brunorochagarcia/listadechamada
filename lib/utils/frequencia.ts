import type { StatusPresenca } from "@prisma/client";

type PresencaMinima = { status: StatusPresenca };

export type Frequencia = {
  percentual: number;
  total: number;
  presentes: number;
  atrasados: number;
  ausentes: number;
};

/**
 * Calcula a frequência de um aluno.
 * Regra: PRESENTE e ATRASADO contam como presença; AUSENTE não conta.
 * Aluno sem registros é tratado como 100% para não aparecer como irregular.
 */
export function calcularFrequencia(presencas: PresencaMinima[]): Frequencia {
  const total = presencas.length;
  if (total === 0) return { percentual: 100, total: 0, presentes: 0, atrasados: 0, ausentes: 0 };

  const presentes = presencas.filter((p) => p.status === "PRESENTE").length;
  const atrasados = presencas.filter((p) => p.status === "ATRASADO").length;
  const ausentes = presencas.filter((p) => p.status === "AUSENTE").length;
  const percentual = Math.round(((presentes + atrasados) / total) * 100);

  return { percentual, total, presentes, atrasados, ausentes };
}

/**
 * Determina a situação do aluno com base no percentual de frequência.
 * Limiar mínimo: 75% (abaixo disso = Irregular, sujeito a reprovação por falta).
 */
export function calcularSituacao(percentual: number): "Regular" | "Irregular" {
  return percentual >= 75 ? "Regular" : "Irregular";
}