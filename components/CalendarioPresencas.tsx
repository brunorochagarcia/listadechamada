import type { StatusPresenca } from "@prisma/client";

type Presenca = { data: Date; status: StatusPresenca };

type Props = { presencas: Presenca[] };

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const statusConfig = {
  PRESENTE:  { bg: "bg-green-500",  title: "Presente" },
  AUSENTE:   { bg: "bg-red-500",    title: "Ausente" },
  ATRASADO:  { bg: "bg-yellow-400", title: "Atrasado" },
} satisfies Record<StatusPresenca, { bg: string; title: string }>;

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
    return <p className="text-sm text-gray-400">Nenhum registro de presença.</p>;
  }

  const meses = agruparPorMes(presencas);

  return (
    <div className="space-y-6">
      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        {Object.entries(statusConfig).map(([status, { bg, title }]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={`size-3 rounded-full ${bg}`} />
            {title}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-gray-100 border border-gray-200" />
          Sem aula
        </span>
      </div>

      {meses.map(({ ano, mes, dias }) => {
        const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        const primeiroDiaSemana = new Date(Date.UTC(ano, mes - 1, 1)).getUTCDay();
        const totalDias = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
        const celulas = primeiroDiaSemana + totalDias;
        const linhas = Math.ceil(celulas / 7);

        return (
          <div key={`${ano}-${mes}`} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 capitalize">{nomeMes}</p>

            <div className="grid grid-cols-7 gap-1">
              {DIAS_SEMANA.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 pb-1">{d}</div>
              ))}

              {Array.from({ length: linhas * 7 }, (_, i) => {
                const diaNum = i - primeiroDiaSemana + 1;
                if (diaNum < 1 || diaNum > totalDias) {
                  return <div key={i} />;
                }
                const status = dias.get(diaNum);
                const cfg = status ? statusConfig[status] : null;

                return (
                  <div
                    key={i}
                    title={cfg ? `${diaNum} — ${cfg.title}` : `${diaNum} — Sem aula`}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <span className="text-xs text-gray-500">{diaNum}</span>
                    <span
                      className={`size-5 rounded-full ${cfg ? cfg.bg : "bg-gray-100 border border-gray-200"}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
