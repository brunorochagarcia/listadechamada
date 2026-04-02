import Link from "next/link";
import { getTurmas } from "@/lib/api/turmas";
import { Users, GraduationCap } from "lucide-react";
import { TurmaDeleteButton } from "./TurmaDeleteButton";
import { NovaTurmaModal } from "@/components/NovaTurmaModal";
import { EditarTurmaModal } from "@/components/EditarTurmaModal";
import { RelatorioTurmaModal } from "@/components/RelatorioTurmaModal";

const turnoConfig = {
  MANHA:  { label: "Manhã",  badge: "bg-amber-100 text-amber-700" },
  TARDE:  { label: "Tarde",  badge: "bg-blue-100 text-blue-700" },
  NOITE:  { label: "Noite",  badge: "bg-slate-100 text-slate-600" },
};

export default async function TurmasPage() {
  const turmas = await getTurmas();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Turmas</h1>
          <p className="text-sm text-slate-500 mt-1">{turmas.length} turma{turmas.length !== 1 ? "s" : ""} cadastrada{turmas.length !== 1 ? "s" : ""}</p>
        </div>
        <NovaTurmaModal />
      </div>

      {turmas.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          Nenhuma turma cadastrada. Crie a primeira.
        </div>
      ) : (
        <div className="space-y-3">
          {turmas.map((turma) => {
            const turno = turnoConfig[turma.turno];
            return (
              <div
                key={turma.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 px-5 py-4"
              >
                {/* Ícone */}
                <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <GraduationCap size={22} className="text-blue-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-extrabold text-slate-800">{turma.nome}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${turno.badge}`}>
                      {turno.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm">
                    <span>{turma.anoLetivo}</span>
                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      {turma._count.alunos} aluno{turma._count.alunos !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 shrink-0">
                  <RelatorioTurmaModal turmaId={turma.id} turmaNome={turma.nome} />
                  <EditarTurmaModal turma={turma} />
                  <TurmaDeleteButton id={turma.id} nome={turma.nome} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
