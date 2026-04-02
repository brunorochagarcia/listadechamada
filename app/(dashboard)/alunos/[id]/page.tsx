import { getAlunoComPresencas } from "@/lib/api/alunos";
import { calcularFrequencia, calcularSituacao } from "@/lib/utils/frequencia";
import { CalendarioPresencas } from "@/components/CalendarioPresencas";
import { ExportButtons } from "@/components/ExportButtons";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, CreditCard, UserX, BarChart2 } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function RelatorioAlunoPage({ params }: Props) {
  const { id } = await params;
  const aluno = await getAlunoComPresencas(id);
  if (!aluno) notFound();

  const { percentual, total, ausentes } = calcularFrequencia(aluno.presencas);
  const situacao = calcularSituacao(percentual);
  const isRegular = situacao === "Regular";

  return (
    <div className="space-y-8">
      <Link href="/alunos" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={15} /> Voltar para Alunos
      </Link>

      {/* Perfil do aluno */}
      <section className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            {aluno.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={aluno.fotoUrl}
                alt={aluno.nome}
                className="w-20 h-20 rounded-xl object-cover ring-4 ring-white shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center text-3xl font-bold text-slate-400 ring-4 ring-white shadow-sm">
                {aluno.nome[0].toUpperCase()}
              </div>
            )}
            <div className={`absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full border-2 border-white ${isRegular ? "bg-green-500" : "bg-red-500"}`} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">{aluno.nome}</h2>
            <div className="flex gap-4 mt-1.5 text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm">
                <BookOpen size={14} /> {aluno.turma.nome}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Users size={14} /> {aluno.turma.anoLetivo}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <CreditCard size={14} /> Mat: {aluno.matricula}
              </span>
            </div>
          </div>
        </div>
        <ExportButtons alunoId={id} />
      </section>

      {/* Bento grid: stats + calendário */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stats */}
        <div className="lg:col-span-3 space-y-4">
          {/* Total de Aulas */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Aulas</p>
              <h3 className="text-4xl font-black text-slate-800 mt-1">{total}</h3>
            </div>
            <BookOpen size={28} className="text-blue-300 shrink-0" />
          </div>

          {/* Total de Faltas */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-red-500 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Faltas</p>
              <h3 className="text-4xl font-black text-red-600 mt-1">{ausentes}</h3>
            </div>
            <UserX size={28} className="text-red-300 shrink-0" />
          </div>

          {/* Frequência Geral */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frequência Geral</p>
              <h3 className={`text-4xl font-black mt-1 ${isRegular ? "text-blue-600" : "text-red-600"}`}>{percentual}%</h3>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3">
                <div
                  className={`h-full rounded-full ${isRegular ? "bg-blue-500" : "bg-red-500"}`}
                  style={{ width: `${percentual}%` }}
                />
              </div>
            </div>
            <BarChart2 size={64} className="absolute -right-3 -bottom-3 text-slate-100" />
          </div>
        </div>

        {/* Calendário */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Calendário de Presença</h3>
          <CalendarioPresencas presencas={aluno.presencas} />
        </div>
      </div>
    </div>
  );
}
