import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Dias úteis de 02/03/2026 a 27/03/2026
function diasUteis(): Date[] {
  const dias: Date[] = [];
  const inicio = new Date("2026-03-02T12:00:00");
  const fim = new Date("2026-03-27T12:00:00");
  for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) dias.push(new Date(d));
  }
  return dias;
}

function randomStatus(): "PRESENTE" | "AUSENTE" | "ATRASADO" {
  const r = Math.random();
  if (r < 0.65) return "PRESENTE";
  if (r < 0.85) return "AUSENTE";
  return "ATRASADO";
}

async function main() {
  // ── Admin ──────────────────────────────────────────────────────────────────
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
  console.log("✅ Admin criado/mantido");

  // ── Limpar dados anteriores ────────────────────────────────────────────────
  await prisma.presenca.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.turma.deleteMany();
  console.log("🗑️  Dados anteriores removidos");

  // ── Turmas ─────────────────────────────────────────────────────────────────
  const turmasDefs = [
    { nome: "3A", turno: "MANHA" as const, anoLetivo: "2026" },
    { nome: "2B", turno: "TARDE" as const, anoLetivo: "2026" },
    { nome: "1C", turno: "NOITE" as const, anoLetivo: "2026" },
    { nome: "4D", turno: "MANHA" as const, anoLetivo: "2026" },
    { nome: "5E", turno: "TARDE" as const, anoLetivo: "2026" },
  ];
  const turmas = await Promise.all(turmasDefs.map((d) => prisma.turma.create({ data: d })));
  console.log(`✅ ${turmas.length} turmas criadas`);

  // ── Alunos — 7 por turma ───────────────────────────────────────────────────
  const nomes = [
    ["Ana Clara Souza",     "Bruno Henrique Lima", "Carla Pereira",    "Diego Martins",   "Elisa Ferreira",  "Pedro Almeida",    "Tatiane Moura"],
    ["Felipe Costa",        "Gabriela Nunes",      "Hugo Alves",       "Isabela Rocha",   "João Pedro Gomes","Rafaela Duarte",   "Uriel Nascimento"],
    ["Karen Oliveira",      "Lucas Mendes",        "Marina Santos",    "Nicolas Barbosa", "Olivia Carvalho", "Samuel Teixeira",  "Vanessa Campos"],
    ["Arthur Rezende",      "Beatriz Fonseca",     "Caio Drummond",    "Daniela Vieira",  "Eduardo Pinto",   "Fernanda Lopes",   "Gustavo Ramos"],
    ["Helena Meireles",     "Igor Cavalcanti",     "Juliana Borges",   "Kevin Andrade",   "Laura Freitas",   "Mateus Cardoso",   "Natália Correia"],
  ];

  let matricula = 1;
  const todosAlunos: { id: string; turmaId: string; role: "PRESENTE_100" | "AUSENTE_100" | "ATRASADO_100" | "RANDOM" }[] = [];

  // índice 5 e 6 de cada turma → INATIVO (para testar soft-delete)
  for (let t = 0; t < turmas.length; t++) {
    const turma = turmas[t];
    // índice 0 → 100% PRESENTE, 1 → 100% AUSENTE, 2 → 100% ATRASADO, 5-6 → INATIVO, resto → aleatório
    for (let a = 0; a < 7; a++) {
      const status = a >= 5 ? "INATIVO" as const : "ATIVO" as const;
      const aluno = await prisma.aluno.create({
        data: {
          nome: nomes[t][a],
          matricula: `2026${String(matricula).padStart(3, "0")}`,
          turmaId: turma.id,
          emailResponsavel: `resp${String(matricula).padStart(2, "0")}@email.com`,
          status,
        },
      });
      const role =
        a === 0 ? "PRESENTE_100" :
        a === 1 ? "AUSENTE_100" :
        a === 2 ? "ATRASADO_100" :
        "RANDOM";
      todosAlunos.push({ id: aluno.id, turmaId: turma.id, role });
      matricula++;
    }
  }
  console.log(`✅ ${matricula - 1} alunos criados (10 INATIVO, ${matricula - 11} ATIVO)`);

  // ── Presenças ──────────────────────────────────────────────────────────────
  const dias = diasUteis();
  const presencasDefs: { alunoId: string; turmaId: string; data: Date; status: "PRESENTE" | "AUSENTE" | "ATRASADO" }[] = [];

  for (const { id, turmaId, role } of todosAlunos) {
    for (const dia of dias) {
      let status: "PRESENTE" | "AUSENTE" | "ATRASADO";
      if (role === "PRESENTE_100")  status = "PRESENTE";
      else if (role === "AUSENTE_100")  status = "AUSENTE";
      else if (role === "ATRASADO_100") status = "ATRASADO";
      else status = randomStatus();
      presencasDefs.push({ alunoId: id, turmaId, data: dia, status });
    }
  }

  await prisma.presenca.createMany({ data: presencasDefs });
  console.log(`✅ ${presencasDefs.length} registros de presença criados (${dias.length} dias úteis)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
