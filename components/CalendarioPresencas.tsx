import type { StatusPresenca } from "@prisma/client";

type Presenca = { data: Date; status: StatusPresenca };
type Props = { presencas: Presenca[] };

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const statusConfig = {
  PRESENTE: {
    cell: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
    label: "Presença",
  },
  AUSENTE: {
    cell: "bg-red-100",
    text: "text-red-700 font-semibold",
    dot: "bg-red-500",
    label: "Falta",
  },
  ATRASADO: {
    cell: "bg-amber-100",
    text: "text-amber-700 font-semibold",
    dot: "bg-amber-500",
    label: "Atraso",
  },
} satisfies Record<StatusPresenca, { cell: string; text: string; dot: string; label: string }>;

function agruparPorMes(presencas: Presenca[]) {
  const meses = new Map<string, Map<number, StatusPresenca>>();
  for (const p of presencas) {
    const d = new Date(p.data);
    const chave = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!meses.has(chave)) meses.set(chave, new Map());
    meses.get(chave)!.set(d.getUTCDate(), p.status);
  }
  return Array.from(meses.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, dias]) => {
      const [ano, mes] = chave.split("-").map(Number);
      return { ano, mes, dias };
    });
}

export function CalendarioPresencas({ presencas }: Props) {
  if (presencas.length === 0) {
    return <p className="text-sm text-slate-400">Nenhum registro de presença.</p>;
  }

  const meses = agruparPorMes(presencas);

  return (
    <div className="space-y-8">
      {meses.map(({ ano, mes, dias }) => {
        const nomeMes = new Date(ano, mes - 1, 1)
          .toLocaleDateString("pt-BR", { month: "long" });
        const nomeMesCap = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
        const primeiroDiaSemana = new Date(Date.UTC(ano, mes - 1, 1)).getUTCDay();
        const totalDias = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
        const linhas = Math.ceil((primeiroDiaSemana + totalDias) / 7);

        return (
          <div key={`${ano}-${mes}`}>
            {/* Cabeçalho do mês */}
            <div className="flex items-baseline gap-3 mb-4">
              <h4 className="text-base font-bold text-slate-800">{nomeMesCap}</h4>
              <span className="text-xs text-slate-400">{ano}</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Cabeçalho dias da semana */}
              {DIAS_SEMANA.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 pb-1 tracking-wider">
                  {d}
                </div>
              ))}

              {/* Células */}
              {Array.from({ length: linhas * 7 }, (_, i) => {
                const diaNum = i - primeiroDiaSemana + 1;

                // fora do mês
                if (diaNum < 1 || diaNum > totalDias) {
                  return <div key={i} />;
                }

                const status = dias.get(diaNum);
                const cfg = status ? statusConfig[status] : null;
                const isWeekend = (i % 7 === 0) || (i % 7 === 6);

                return (
                  <div
                    key={i}
                    title={cfg ? `${diaNum} — ${cfg.label}` : isWeekend ? `${diaNum} — Final de semana` : `${diaNum} — Sem aula`}
                    className={`
                      flex flex-col items-center justify-between rounded-lg py-2 px-1 min-h-[52px] transition-colors
                      ${cfg ? cfg.cell : isWeekend ? "bg-slate-50" : ""}
                    `}
                  >
                    <span className={`text-sm ${cfg ? cfg.text : isWeekend ? "text-slate-300" : "text-slate-400"}`}>
                      {diaNum}
                    </span>
                    {cfg ? (
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Legenda */}
      <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
        {Object.values(statusConfig).map(({ dot, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium uppercase tracking-wide">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-slate-200" />
          Sem Aula / Final de Semana
        </span>
      </div>
    </div>
  );
}
