"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

function isBancoIndisponivel(error: Error) {
  return error.message.includes("Can't reach database") || error.message.includes("prisma");
}

function getTitulo(error: Error): string {
  if (isBancoIndisponivel(error)) return "Erro 500: Banco de Dados Indisponível";
  return "Algo deu errado";
}

function getMensagemAmigavel(error: Error): string {
  if (isBancoIndisponivel(error)) {
    return "Sinto muito, algo está errado com o banco de dados. Estamos trabalhando e em breve tudo estará resolvido.";
  }
  return "Ocorreu um erro inesperado.";
}

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <h2 className="text-xl font-semibold text-gray-900">{getTitulo(error)}</h2>
      <p className="text-sm text-gray-500 max-w-sm">{getMensagemAmigavel(error)}</p>
      <Button onClick={reset} variant="outline">Tentar novamente</Button>
    </div>
  );
}
