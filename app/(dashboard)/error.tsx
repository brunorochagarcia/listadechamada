"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <h2 className="text-xl font-semibold text-gray-900">Algo deu errado</h2>
      <p className="text-sm text-gray-500 max-w-sm">{error.message || "Ocorreu um erro inesperado."}</p>
      <Button onClick={reset} variant="outline">Tentar novamente</Button>
    </div>
  );
}
