import type { StatusPresenca } from "@prisma/client";

type PresencaMinima = { status: StatusPresenca };

// PRESENTE e ATRASADO contam como presença; AUSENTE não conta
export function calcularFrequencia(presencas: PresencaMinima[]): number {
  if (presencas.length === 0) return 100;

  const presentes = presencas.filter(
    (p) => p.status === "PRESENTE" || p.status === "ATRASADO"
  ).length;

  return Math.round((presentes / presencas.length) * 100);
}

// Limiar: 75%
export function calcularSituacao(percentual: number): "Regular" | "Irregular" {
  return percentual >= 75 ? "Regular" : "Irregular";
}
