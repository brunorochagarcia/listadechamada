import { prisma } from "@/lib/prisma";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

async function getDashboardData() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Presenças do dia agrupadas por turma
  const presencasHoje = await prisma.presenca.findMany({
    where: { data: hoje },
    include: { turma: true },
  });

  const turmasMap = new Map<string, {
    nome: string;
    PRESENTE: number;
    AUSENTE: number;
    ATRASADO: number;
  }>();

  for (const p of presencasHoje) {
    if (!turmasMap.has(p.turmaId)) {
      turmasMap.set(p.turmaId, { nome: p.turma.nome, PRESENTE: 0, AUSENTE: 0, ATRASADO: 0 });
    }
    turmasMap.get(p.turmaId)![p.status]++;
  }

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
      percentual: calcularFrequencia(a.presencas),
    }))
    .filter((a) => calcularSituacao(a.percentual) === "Irregular");

  return { turmas: Array.from(turmasMap.values()), irregulares };
}

export default async function DashboardPage() {
  const { turmas, irregulares } = await getDashboardData();
  const hoje = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do dia — {hoje}</p>
      </div>

      {/* Cards de chamada do dia por turma */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Chamada de hoje</h2>
        {turmas.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma chamada registrada hoje.</p>
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
