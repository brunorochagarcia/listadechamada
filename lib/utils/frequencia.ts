import type { StatusPresenca } from "@prisma/client";

type PresencaMinima = { status: StatusPresenca };

/**
 * Calcula o percentual de frequência de um aluno.
 * Regra: PRESENTE e ATRASADO contam como presença; AUSENTE não conta.
 * Aluno sem registros é tratado como 100% para não aparecer como irregular.
 */
export function calcularFrequencia(presencas: PresencaMinima[]): number {
  if (presencas.length === 0) return 100;

  const presentes = presencas.filter(
    (p) => p.status === "PRESENTE" || p.status === "ATRASADO"
  ).length;

  return Math.round((presentes / presencas.length) * 100);
}

/**
 * Determina a situação do aluno com base no percentual de frequência.
 * Limiar mínimo: 75% (abaixo disso = Irregular, sujeito a reprovação por falta).
 */
export function calcularSituacao(percentual: number): "Regular" | "Irregular" {
  return percentual >= 75 ? "Regular" : "Irregular";
}
