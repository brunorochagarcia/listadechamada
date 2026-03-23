import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Gera todos os dias úteis de março/2026 até hoje inclusive
function diasUteisMarco2026(): Date[] {
  const datas: Date[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const inicio = new Date(Date.UTC(2026, 2, 1)); // 1º de março de 2026

  let cursor = new Date(inicio);
  while (cursor <= hoje) {
    const diaSemana = cursor.getUTCDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      datas.push(new Date(cursor));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return datas;
}

async function main() {
  // ── Admin ─────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@listadechamada.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@listadechamada.com",
      senha: senhaHash,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin criado");

  // ── Limpar dados anteriores (ordem importa por FK) ────────
  await prisma.presenca.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.turma.deleteMany();

  // ── Turmas ────────────────────────────────────────────────
  const [t1, t2, t3] = await Promise.all([
    prisma.turma.create({ data: { nome: "3A", turno: "MANHA", anoLetivo: "2026" } }),
    prisma.turma.create({ data: { nome: "2B", turno: "TARDE", anoLetivo: "2026" } }),
    prisma.turma.create({ data: { nome: "1C", turno: "NOITE", anoLetivo: "2026" } }),
  ]);
  console.log("✅ Turmas criadas: 3A (Manhã), 2B (Tarde), 1C (Noite)");

  // ── Alunos ────────────────────────────────────────────────
  // Cada turma tem 5 alunos com perfis de frequência variados
  const alunosDefs = [
    // TURMA 3A — Manhã
    { nome: "Ana Clara Souza",    matricula: "2026001", turmaId: t1.id, emailResponsavel: "resp1@email.com" },
    { nome: "Bruno Henrique Lima", matricula: "2026002", turmaId: t1.id, emailResponsavel: "resp2@email.com" },
    { nome: "Carla Pereira",      matricula: "2026003", turmaId: t1.id, emailResponsavel: "resp3@email.com" },
    { nome: "Diego Martins",      matricula: "2026004", turmaId: t1.id, emailResponsavel: "resp4@email.com" },
    { nome: "Elisa Ferreira",     matricula: "2026005", turmaId: t1.id, emailResponsavel: "resp5@email.com" },
    // TURMA 2B — Tarde
    { nome: "Felipe Costa",       matricula: "2026006", turmaId: t2.id, emailResponsavel: "resp6@email.com" },
    { nome: "Gabriela Nunes",     matricula: "2026007", turmaId: t2.id, emailResponsavel: "resp7@email.com" },
    { nome: "Hugo Alves",         matricula: "2026008", turmaId: t2.id, emailResponsavel: "resp8@email.com" },
    { nome: "Isabela Rocha",      matricula: "2026009", turmaId: t2.id, emailResponsavel: "resp9@email.com" },
    { nome: "João Pedro Gomes",   matricula: "2026010", turmaId: t2.id, emailResponsavel: "resp10@email.com" },
    // TURMA 1C — Noite
    { nome: "Karen Oliveira",     matricula: "2026011", turmaId: t3.id, emailResponsavel: "resp11@email.com" },
    { nome: "Lucas Mendes",       matricula: "2026012", turmaId: t3.id, emailResponsavel: "resp12@email.com" },
    { nome: "Marina Santos",      matricula: "2026013", turmaId: t3.id, emailResponsavel: "resp13@email.com" },
    { nome: "Nicolas Barbosa",    matricula: "2026014", turmaId: t3.id, emailResponsavel: "resp14@email.com" },
    { nome: "Olivia Carvalho",    matricula: "2026015", turmaId: t3.id, emailResponsavel: "resp15@email.com" },
    // 100% — um por turma
    { nome: "Pedro Almeida",      matricula: "2026016", turmaId: t1.id, emailResponsavel: "resp16@email.com" },
    { nome: "Rafaela Duarte",     matricula: "2026017", turmaId: t2.id, emailResponsavel: "resp17@email.com" },
    { nome: "Samuel Teixeira",    matricula: "2026018", turmaId: t3.id, emailResponsavel: "resp18@email.com" },
    // 0% — um por turma
    { nome: "Tatiane Moura",      matricula: "2026019", turmaId: t1.id, emailResponsavel: "resp19@email.com" },
    { nome: "Uriel Nascimento",   matricula: "2026020", turmaId: t2.id, emailResponsavel: "resp20@email.com" },
    { nome: "Vanessa Campos",     matricula: "2026021", turmaId: t3.id, emailResponsavel: "resp21@email.com" },
  ];

  const alunos = await Promise.all(
    alunosDefs.map((d) => prisma.aluno.create({ data: d }))
  );
  console.log(`✅ ${alunos.length} alunos criados`);

  // ── Presenças — dias úteis de março/2026 até hoje ────────
  // Índices: 0=02/03, 1=03/03, 2=04/03, 3=05/03, 4=06/03,
  //          5=09/03, 6=10/03, 7=11/03, 8=12/03, 9=13/03,
  //          10=16/03, 11=17/03, 12=18/03  → total: 13 dias
  const datas = diasUteisMarco2026();

  // Perfis de frequência (13 dias):
  //  0 → ~95%: 12/13 presente
  //  1 → ~85%: 11/13 presente (2 faltas, 1 atraso)
  //  2 → ~77%: 10/13 presente (3 faltas)
  //  3 → ~62%:  8/13 presente (5 faltas, 1 atraso)
  //  4 → ~38%:  5/13 presente (8 faltas)
  //  5 → 100%: presença perfeita
  //  6 →   0%: nunca compareceu
  type Status = "PRESENTE" | "AUSENTE" | "ATRASADO";

  function statusPerfil(perfil: number, diaIndex: number): Status {
    switch (perfil) {
      case 0: return diaIndex === 6 ? "AUSENTE" : "PRESENTE";
      case 1:
        if ([3, 10].includes(diaIndex)) return "AUSENTE";
        if ([7].includes(diaIndex)) return "ATRASADO";
        return "PRESENTE";
      case 2: return [1, 5, 10].includes(diaIndex) ? "AUSENTE" : "PRESENTE";
      case 3:
        if ([0, 2, 7, 9, 11].includes(diaIndex)) return "AUSENTE";
        if ([4].includes(diaIndex)) return "ATRASADO";
        return "PRESENTE";
      case 4:
        if ([0,1,3,5,7,9,10,12].includes(diaIndex)) return "AUSENTE";
        if ([6].includes(diaIndex)) return "ATRASADO";
        return "PRESENTE";
      case 5: return "PRESENTE";   // 100%
      case 6: return "AUSENTE";    // 0%
      default: return "PRESENTE";
    }
  }

  // Perfil por aluno: índices 0–14 usam i%5, índices 15–17 = perfil 5 (100%), 18–20 = perfil 6 (0%)
  function perfilAluno(i: number): number {
    if (i >= 15 && i <= 17) return 5;
    if (i >= 18 && i <= 20) return 6;
    return i % 5;
  }

  // Gerar presenças para cada aluno
  const presencasDefs: { alunoId: string; turmaId: string; data: Date; status: Status }[] = [];

  for (const [i, aluno] of alunos.entries()) {
    const perfil = perfilAluno(i);
    for (const [diaIndex, data] of datas.entries()) {
      presencasDefs.push({
        alunoId: aluno.id,
        turmaId: aluno.turmaId,
        data,
        status: statusPerfil(perfil, diaIndex),
      });
    }
  }

  await prisma.presenca.createMany({ data: presencasDefs });
  console.log(`✅ ${presencasDefs.length} registros de presença criados`);

  // ── Resumo de frequência ─────────────────────────────────
  console.log("\n📊 Resumo de frequência:");
  for (const [i, aluno] of alunos.entries()) {
    const perfil = perfilAluno(i);
    const presencas = presencasDefs.filter((p) => p.alunoId === aluno.id);
    const presentes = presencas.filter((p) => p.status !== "AUSENTE").length;
    const pct = Math.round((presentes / presencas.length) * 100);
    const situacao = pct >= 75 ? "Regular ✅" : "Irregular ⚠️";
    console.log(`  ${aluno.nome.padEnd(22)} perfil ${perfil}  ${pct}%  ${situacao}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
