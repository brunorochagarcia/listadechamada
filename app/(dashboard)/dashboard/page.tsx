import { prisma } from "@/lib/prisma";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UserCheck, UserX, Clock } from "lucide-react";

async function getDashboardData(data: Date) {
  // Presenças do dia agrupadas por turma
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

  // Alunos irregulares
  const alunos = await prisma.aluno.findMany({
    include: { presencas: true, turma: true },
    orderBy: { nome: "asc" },
  });

  const irregulares = alunos
    .map((a) => ({
      id: a.id,
      nome: a.nome,
      matricula: a.matricula,
      turma: a.turma.nome,
      percentual: calcularFrequencia(a.presencas).percentual,
    }))
    .filter((a) => calcularSituacao(a.percentual) === "Irregular");

  return { turmas, totais, irregulares };
}

type Props = { searchParams: Promise<{ data?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const { data: dataParam } = await searchParams;

  const hoje = new Date().toISOString().split("T")[0];
  const dataSelecionada = dataParam ?? hoje;

  const dataObj = new Date(dataSelecionada);
  dataObj.setUTCHours(0, 0, 0, 0);

  const { turmas, totais, irregulares } = await getDashboardData(dataObj);

  const dataFormatada = new Date(dataSelecionada).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  const ehHoje = dataSelecionada === hoje;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visão geral de {ehHoje ? "hoje" : dataFormatada}
          </p>
        </div>
        <form method="GET" className="flex items-end gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              name="data"
              type="date"
              defaultValue={dataSelecionada}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          >
            Consultar
          </button>
        </form>
      </div>

      {/* Cards de totais globais do dia */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">
          Totais do dia
        </h2>
        <div className="grid gap-4 grid-cols-3">
          {(
            [
              { status: "PRESENTE", label: "Presentes", value: totais.PRESENTE, color: "text-green-700", bg: "bg-green-50 border-green-200", icon: UserCheck },
              { status: "AUSENTE", label: "Ausentes", value: totais.AUSENTE, color: "text-red-700", bg: "bg-red-50 border-red-200", icon: UserX },
              { status: "ATRASADO", label: "Atrasados", value: totais.ATRASADO, color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: Clock },
            ] as const
          ).map(({ status, label, value, color, bg, icon: Icon }) => (
            <div key={status} className={`rounded-xl border p-5 ${bg}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <Icon size={18} className={color} />
              </div>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cards de chamada do dia por turma */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Chamada por turma</h2>
        {turmas.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma chamada registrada{ehHoje ? " hoje" : ` em ${dataFormatada}`}.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {turmas.map((t) => {
              const total = t.PRESENTE + t.AUSENTE + t.ATRASADO;
              return (
                <div key={t.nome} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <p className="font-semibold text-gray-900">{t.nome}</p>
                  <p className="text-xs text-gray-400">{total} aluno(s) registrado(s)</p>
                  <div className="flex gap-2 flex-wrap">
                    <StatusBadge status="PRESENTE" /><span className="text-sm font-medium">{t.PRESENTE}</span>
                    <StatusBadge status="AUSENTE" /><span className="text-sm font-medium">{t.AUSENTE}</span>
                    <StatusBadge status="ATRASADO" /><span className="text-sm font-medium">{t.ATRASADO}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Alunos irregulares */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">
          Alunos Irregulares{" "}
          {irregulares.length > 0 && (
            <Badge variant="destructive" className="ml-1">{irregulares.length}</Badge>
          )}
        </h2>
        {irregulares.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum aluno com frequência irregular.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {irregulares.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link href={`/alunos/${a.id}`} className="font-medium text-gray-900 hover:underline">
                    {a.nome}
                  </Link>
                  <p className="text-sm text-gray-500">Turma {a.turma} · Mat. {a.matricula}</p>
                </div>
                <span className="text-sm font-semibold text-red-600">{a.percentual}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
