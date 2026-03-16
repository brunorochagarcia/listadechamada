"use client";

import { FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportButtons({ alunoId }: { alunoId: string }) {
  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={() => window.open(`/api/relatorio/${alunoId}/pdf`, "_blank")}
      >
        <FileText size={16} />
        Exportar PDF
      </Button>
      <Button
        variant="outline"
        onClick={() => window.open(`/api/relatorio/${alunoId}/csv`, "_blank")}
      >
        <FileSpreadsheet size={16} />
        Exportar CSV
      </Button>
    </div>
  );
}
