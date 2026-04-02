"use client";

import { FileText } from "lucide-react";

export function ExportIrregularesButton() {
  return (
    <button
      onClick={() => window.open("/api/relatorio/irregulares/pdf", "_blank")}
      className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all active:scale-95"
    >
      <FileText size={16} />
      Exportar PDF
    </button>
  );
}
