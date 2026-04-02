import { prisma } from "@/lib/prisma";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { NotificarButton } from "@/components/NotificarButton";
import Link from "next/link";
import { Users, CheckCircle, AlertTriangle } from "lucide-react";

async function getDashboardData(data: Date) {
  const presencasDia = await prisma.presenca.findMany({
    where: { data },
    include: { turma: true },
  });

  const turmasMap = new Map<string, {
    nome: string;
    PRESENTE: number;
    AUSENTE: number;
    ATRASADO: number;
  }>();

  for (const p of presencasDia) {
    if (!turmasMap.has(p.turmaId)) {
      turmasMap.set(p.turmaId, { nome: p.turma.nome, PRESENTE: 0, AUSENTE: 0, ATRASADO: 0 });
    }
    turmasMap.get(p.turmaId)![p.status]++;
  }

  const turmas = Array.from(turmasMap.values());

  const totais = turmas.reduce(
    (acc, t) => ({
      PRESENTE: acc.PRESENTE + t.PRESENTE,
      AUSENTE: acc.AUSENTE + t.AUSENTE,
      ATRASADO: acc.ATRASADO + t.ATRASADO,
    }),
    { PRESENTE: 0, AUSENTE: 0, ATRASADO: 0 }
  );

  const alunos = await prisma.aluno.findMany({
    include: { presencas: true, turma: true },
    orderBy: { nome: "asc" },
  });

  const totalAlunos = alunos.length;

  const irregulares = alunos
    .map((a) => ({
      id: a.id,
      nome: a.nome,
      matricula: a.matricula,
      turma: a.turma.nome,
      emailResponsavel: a.emailResponsavel,
      percentual: calcularFrequencia(a.presencas).percentual,
    }))
    .filter((a) => calcularSituacao(a.percentual) === "Irregular");

  const totalDia = totais.PRESENTE + totais.AUSENTE + totais.ATRASADO;
  const percentualPresencaDia = totalDia > 0 ? Math.round((totais.PRESENTE / totalDia) * 100) : 0;

  return { turmas, totais, irregulares, totalAlunos, percentualPresencaDia, totalDia };
}

type Props = { searchParams: Promise<{ data?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const { data: dataParam } = await searchParams;

  const hoje = new Date().toISOString().split("T")[0];
  const dataSelecionada = dataParam ?? hoje;

  const dataObj = new Date(dataSelecionada);
  dataObj.setUTCHours(0, 0, 0, 0);

  const { turmas, totais, irregulares, totalAlunos, percentualPresencaDia, totalDia } = await getDashboardData(dataObj);

  const dataFormatada = new Date(dataSelecionada).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  const ehHoje = dataSelecionada === hoje;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Visão Geral de Frequência</h2>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhamento de {ehHoje ? "hoje" : dataFormatada}.
          </p>
        </div>
        <div className="flex gap-3 items-end">
          <form method="GET" className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data</label>
              <input
                name="data"
                type="date"
                defaultValue={dataSelecionada}
                className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md transition-all"
            >
              Consultar
            </button>
          </form>
          <Link
            href="/presencas"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Nova Chamada
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={22} className="text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Total de Alunos</p>
          <h3 className="text-3xl font-black text-slate-800">{totalAlunos}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={22} className="text-green-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Meta: 95%</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Presença {ehHoje ? "Hoje" : dataFormatada}</p>
          <h3 className="text-3xl font-black text-slate-800">
            {totalDia > 0 ? `${percentualPresencaDia}%` : "—"}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            {irregulares.length > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Atenção</span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500">Alunos Irregulares</p>
          <h3 className="text-3xl font-black text-slate-800">{irregulares.length}</h3>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {turmas.length > 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-6">Chamada por Turma</h4>
              <div className="space-y-5">
                {turmas.map((t) => {
                  const total = t.PRESENTE + t.AUSENTE + t.ATRASADO;
                  const pct = total > 0 ? Math.round((t.PRESENTE / total) * 100) : 0;
                  return (
                    <div key={t.nome}>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>{t.nome}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{t.PRESENTE} presentes · {t.AUSENTE} ausentes · {t.ATRASADO} atrasados</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-800">Alunos em Situação Irregular</h4>
              <Link href="/alunos" className="text-blue-600 text-xs font-bold hover:underline">Ver Todos</Link>
            </div>
            {irregulares.length === 0 ? (
              <p className="text-sm text-slate-400 p-6">Nenhum aluno com frequência irregular.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Turma</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequência</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {irregulares.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/alunos/${a.id}`} className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">
                            {a.nome}
                          </Link>
                          <p className="text-xs text-slate-400">Mat. {a.matricula}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{a.turma}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500" style={{ width: `${a.percentual}%` }} />
                            </div>
                            <span className="text-xs font-bold text-red-600">{a.percentual}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <NotificarButton id={a.id} temEmail={!!a.emailResponsavel} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {totalDia > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Resumo do Dia</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Presentes</span>
                    <span>{totais.PRESENTE} ({Math.round((totais.PRESENTE / totalDia) * 100)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round((totais.PRESENTE / totalDia) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Ausentes</span>
                    <span>{totais.AUSENTE} ({Math.round((totais.AUSENTE / totalDia) * 100)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.round((totais.AUSENTE / totalDia) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Atrasados</span>
                    <span>{totais.ATRASADO} ({Math.round((totais.ATRASADO / totalDia) * 100)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.round((totais.ATRASADO / totalDia) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Envio em Massa */}
          {irregulares.length > 0 && (
            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <AlertTriangle size={28} className="mb-4" />
                <h4 className="font-bold text-lg mb-2">Envio em Massa</h4>
                <p className="text-white/80 text-sm mb-6">
                  {irregulares.length} aluno{irregulares.length > 1 ? "s" : ""} com frequência abaixo do mínimo exigido.
                </p>
                <Link
                  href="/alunos"
                  className="block w-full py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors text-center"
                >
                  Ver Relatórios
                </Link>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>
          )}

          {/* Atividade Recente */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Atividade Recente</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Chamada Concluída</p>
                  <p className="text-[10px] text-slate-500">Turma 9º A — Prof. Ricardo</p>
                  <p className="text-[10px] text-slate-400 mt-1">há 10 minutos</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Justificativa Aceita</p>
                  <p className="text-[10px] text-slate-500">Mariana Vaz — Atestado Médico</p>
                  <p className="text-[10px] text-slate-400 mt-1">há 45 minutos</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Alerta de Evasão</p>
                  <p className="text-[10px] text-slate-500">Pedro Souza — 5 faltas seguidas</p>
                  <p className="text-[10px] text-slate-400 mt-1">há 2 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
