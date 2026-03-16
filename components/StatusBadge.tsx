import { cn } from "@/lib/utils";
import type { StatusPresenca } from "@prisma/client";

const config: Record<StatusPresenca, { label: string; className: string }> = {
  PRESENTE: { label: "Presente", className: "bg-green-100 text-green-700 border-green-200" },
  AUSENTE: { label: "Ausente", className: "bg-red-100 text-red-700 border-red-200" },
  ATRASADO: { label: "Atrasado", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

export function StatusBadge({ status }: { status: StatusPresenca }) {
  const { label, className } = config[status];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", className)}>
      {label}
    </span>
  );
}
