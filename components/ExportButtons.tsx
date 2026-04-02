"use client";

import { FileText, FileSpreadsheet } from "lucide-react";

export function ExportButtons({ alunoId }: { alunoId: string }) {
  return (
    <div className="flex gap-3 shrink-0">
      <button
        onClick={() => window.open(`/api/relatorio/${alunoId}/pdf`, "_blank")}
        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
      >
        <FileText size={18} />
        Exportar PDF
      </button>
      <button
        onClick={() => window.open(`/api/relatorio/${alunoId}/csv`, "_blank")}
        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
      >
        <FileSpreadsheet size={18} />
        Exportar CSV
      </button>
    </div>
  );
}