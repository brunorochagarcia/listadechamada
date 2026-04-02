"use client";

import { FileText, FileSpreadsheet } from "lucide-react";

export function ExportButtons({ alunoId }: { alunoId: string }) {
  return (
    <div className="flex gap-3 shrink-0">
      <button
        onClick={() => window.open(`/api/relatorio/${alunoId}/pdf`, "_blank")}
        className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2.5 rounded-lg font-bold hover:bg-blue-100 transition-all active:opacity-80"
      >
        <FileText size={18} />
        Exportar PDF
      </button>
      <button
        onClick={() => window.open(`/api/relatorio/${alunoId}/csv`, "_blank")}
        className="flex items-center gap-2 border-2 border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-bold hover:bg-slate-50 transition-all active:opacity-80"
      >
        <FileSpreadsheet size={18} />
        Exportar CSV
      </button>
    </div>
  );
}