# TODO — Lista de Chamada (do zero ao deploy)

---

## FASE 1 — Fundação e Infraestrutura

### 1.1 Configuração de Ambiente
- [ ] Configurar variáveis de ambiente em `.env` (DATABASE_URL, NEXTAUTH_SECRET, Cloudinary, Resend)
- [ ] Criar `lib/env.ts` — validação de variáveis com Zod, tipagem exportada
- [ ] Ajustar `tsconfig.json` para strict mode (verificar se já está ativo)

### 1.2 Banco de Dados
- [ ] Subir instância PostgreSQL local (Docker ou instalação direta)
- [ ] Confirmar conexão com `DATABASE_URL` no `.env`
- [ ] Executar `npx prisma migrate dev --name init` para criar as tabelas
- [ ] Verificar constraints no banco (unique em matrícula, unique em alunoId+data+turmaId)
- [ ] Criar `prisma/seed.ts` — seed do usuário admin (bcrypt na senha)
- [ ] Executar `npx prisma db seed` e confirmar usuário criado
- [ ] Criar `lib/prisma.ts` — singleton do PrismaClient para uso na aplicação

### 1.3 Autenticação
- [ ] Instalar e configurar `next-auth` com credentials provider
- [ ] Criar `auth.ts` na raiz — configuração do NextAuth (callbacks, session strategy)
- [ ] Criar `app/api/auth/[...nextauth]/route.ts`
- [ ] Criar middleware `middleware.ts` — proteger todas as rotas exceto `/login`
- [ ] Criar `app/login/page.tsx` — formulário de login
- [ ] Criar Server Action `app/login/actions.ts` — validação com Zod + signIn
- [ ] Testar login e redirecionamento para dashboard
- [ ] Testar acesso negado sem sessão

### 1.4 Layout Base
- [ ] Criar `app/layout.tsx` raiz — fontes, SessionProvider, Toaster (shadcn)
- [ ] Criar `components/Sidebar.tsx` — navegação lateral (Turmas, Alunos, Presenças, Dashboard)
- [ ] Criar `components/Header.tsx` — nome do usuário logado + botão de logout
- [ ] Criar `app/(dashboard)/layout.tsx` — layout com sidebar e header para rotas protegidas
- [ ] Instalar componentes shadcn necessários: `toast`, `button`, `input`, `select`, `dialog`, `badge`, `card`, `table`

---

## FASE 2 — Utilitários e Camada de Dados

### 2.1 Utilitários
- [ ] Criar `lib/utils/frequencia.ts`
  - [ ] Função `calcularFrequencia(presencas)` → retorna percentual (number)
  - [ ] Função `calcularSituacao(percentual)` → retorna `"Regular"` | `"Irregular"`
  - [ ] Lógica: PRESENTE e ATRASADO contam como presença; AUSENTE não conta

### 2.2 Camada de API (queries server-side)
- [ ] Criar `lib/api/turmas.ts`
  - [ ] `getTurmas()` — lista todas as turmas
  - [ ] `getTurmaById(id)` — retorna turma por ID
- [ ] Criar `lib/api/alunos.ts`
  - [ ] `getAlunos(search?)` — lista com filtro por nome ou matrícula
  - [ ] `getAlunoById(id)` — retorna aluno com turma
  - [ ] `getAlunoComPresencas(id)` — retorna aluno + todas as presenças (para relatório)
- [ ] Criar `lib/api/presencas.ts`
  - [ ] `getPresencasPorTurmaEData(turmaId, data)` — para carregar chamada existente
  - [ ] `getHistoricoPresencas(filtros)` — lista com filtros + paginação

---

## FASE 3 — Módulo de Turmas

- [ ] Criar `app/(dashboard)/turmas/page.tsx` — listagem de turmas (RSC)
- [ ] Criar `app/(dashboard)/turmas/nova/page.tsx` — formulário de criação
- [ ] Criar `app/(dashboard)/turmas/[id]/editar/page.tsx` — formulário de edição
- [ ] Criar `app/(dashboard)/turmas/actions.ts` — Server Actions
  - [ ] `criarTurma(formData)` — validação Zod + insert + revalidatePath
  - [ ] `editarTurma(id, formData)` — validação Zod + update + revalidatePath
  - [ ] `excluirTurma(id)` — verificar vínculos antes de deletar + revalidatePath
- [ ] Criar `components/ConfirmModal.tsx` — modal de confirmação reutilizável
- [ ] Aplicar modal de confirmação na exclusão de turma
- [ ] Testar bloqueio de exclusão quando há alunos vinculados

---

## FASE 4 — Módulo de Alunos

- [ ] Criar `app/(dashboard)/alunos/page.tsx` — listagem com busca por nome/matrícula (RSC)
- [ ] Criar `app/(dashboard)/alunos/novo/page.tsx` — formulário de criação
- [ ] Criar `app/(dashboard)/alunos/[id]/editar/page.tsx` — formulário de edição
- [ ] Criar `app/(dashboard)/alunos/actions.ts` — Server Actions
  - [ ] `criarAluno(formData)` — validação Zod + upload foto Cloudinary (opcional) + insert
  - [ ] `editarAluno(id, formData)` — validação Zod + troca de foto (remover anterior do Cloudinary) + update
  - [ ] `excluirAluno(id)` — remover foto do Cloudinary via publicId + delete
- [ ] Criar `components/AlunoCard.tsx` — card de aluno na listagem
- [ ] Configurar Cloudinary (`lib/cloudinary.ts`) — instância e funções de upload/delete
- [ ] Implementar upload de foto no formulário (input file + preview)
- [ ] Aplicar modal de confirmação na exclusão de aluno
- [ ] Testar unicidade de matrícula (erro amigável via toast)

---

## FASE 5 — Módulo de Presenças

### 5.1 Registro de Chamada
- [ ] Criar `app/(dashboard)/presencas/page.tsx` — seleção de data e turma
- [ ] Criar `components/PresencaForm.tsx` — lista de alunos com status por linha
  - [ ] Carregar alunos da turma selecionada
  - [ ] Busca de aluno por nome ou matrícula dentro da chamada
  - [ ] Pré-popular com chamada existente se já houver registro para data+turma
  - [ ] Botões de status: PRESENTE / AUSENTE / ATRASADO por aluno
- [ ] Criar `app/(dashboard)/presencas/actions.ts`
  - [ ] `salvarChamada(turmaId, data, registros[])` — upsert de presenças (evitar duplicatas via constraint)
  - [ ] Após salvar, recalcular frequência de cada aluno e disparar e-mail se necessário
- [ ] Criar `components/StatusBadge.tsx` — badge colorido por status (verde/amarelo/vermelho)

### 5.2 Histórico
- [ ] Criar `app/(dashboard)/presencas/historico/page.tsx` — listagem com filtros (RSC)
- [ ] Criar `components/FiltroPresenca.tsx` — filtros por data, turma, status
- [ ] Implementar paginação na listagem

---

## FASE 6 — Notificações por E-mail

- [ ] Configurar cliente Resend em `lib/email/resend.ts`
- [ ] Criar `lib/email/alertaFrequencia.ts`
  - [ ] Template HTML do e-mail (nome do aluno, percentual, situação, orientações)
  - [ ] Função `enviarAlertaFrequencia(aluno, percentual)` — envia via Resend
- [ ] Integrar disparo na Server Action `salvarChamada`:
  - [ ] Após salvar cada presença, recalcular frequência do aluno
  - [ ] Se percentual < 75% e `alertaEnviado === false`: enviar e-mail + setar `alertaEnviado = true`
  - [ ] Se percentual >= 75% e `alertaEnviado === true`: resetar `alertaEnviado = false`
- [ ] Testar envio real via Resend (sandbox ou domínio verificado)
- [ ] Testar que e-mail não é reenviado enquanto aluno permanece irregular

---

## FASE 7 — Dashboard

- [ ] Criar `app/(dashboard)/dashboard/page.tsx` (RSC)
  - [ ] Query: agrupar presenças do dia atual por turma
  - [ ] Exibir cards por turma: total PRESENTE, AUSENTE, ATRASADO
  - [ ] Listar alunos com situação Irregular (frequência < 75%) com destaque visual
- [ ] Definir `/dashboard` como rota raiz após login (redirect em middleware ou `app/page.tsx`)

---

## FASE 8 — Relatório Individual e Exportação

### 8.1 Página de Relatório
- [ ] Criar `app/(dashboard)/alunos/[id]/page.tsx` (RSC)
  - [ ] Dados do aluno + turma
  - [ ] Histórico completo de presenças (tabela)
  - [ ] Percentual de frequência calculado via `lib/utils/frequencia.ts`
  - [ ] Badge de situação (Regular/Irregular)
- [ ] Criar `components/ExportButtons.tsx` — botões PDF e CSV que disparam download

### 8.2 Exportação CSV
- [ ] Criar `app/api/relatorio/[id]/csv/route.ts`
  - [ ] Buscar aluno + presenças no banco
  - [ ] Gerar CSV com `papaparse`
  - [ ] Retornar como `text/csv` com header `Content-Disposition`

### 8.3 Exportação PDF
- [ ] Criar `lib/export/pdf.ts` — componente React com `@react-pdf/renderer`
  - [ ] Layout: cabeçalho com nome e turma, tabela de histórico, percentual e situação
- [ ] Criar `app/api/relatorio/[id]/pdf/route.ts`
  - [ ] Renderizar PDF server-side com `renderToBuffer`
  - [ ] Retornar como `application/pdf` com header `Content-Disposition`

---

## FASE 9 — Qualidade e Polimento

- [ ] Adicionar loading states (`loading.tsx`) nas rotas principais
- [ ] Adicionar error boundaries (`error.tsx`) nas rotas principais
- [ ] Adicionar `not-found.tsx` para rotas de aluno/turma inexistentes
- [ ] Revisar todos os formulários: mensagens de erro inline + toasts de sucesso/erro
- [ ] Garantir responsividade em mobile (testar sidebar em telas pequenas)
- [ ] Adicionar comentários nos trechos de lógica complexa (frequencia.ts, salvarChamada, alertaFrequencia)
- [ ] Revisar todos os `revalidatePath` para garantir atualização correta das páginas

---

## FASE 10 — Deploy

- [ ] Criar repositório no GitHub e fazer push inicial
- [ ] Criar projeto na Vercel e conectar ao repositório
- [ ] Configurar variáveis de ambiente na Vercel (DATABASE_URL, NEXTAUTH_SECRET, Cloudinary, Resend)
- [ ] Provisionar banco PostgreSQL em produção (Neon, Supabase ou Railway)
- [ ] Executar `prisma migrate deploy` no ambiente de produção
- [ ] Executar seed do usuário admin em produção
- [ ] Validar domínio no Resend para envio de e-mails
- [ ] Testar fluxo completo em produção (login → turma → aluno → chamada → dashboard → relatório)

---

## Resumo de Fases

| Fase | Descrição | Depende de |
|---|---|---|
| 1 | Fundação e infraestrutura | — |
| 2 | Utilitários e camada de dados | 1 |
| 3 | Módulo de Turmas | 1, 2 |
| 4 | Módulo de Alunos | 1, 2, 3 |
| 5 | Módulo de Presenças | 1, 2, 3, 4 |
| 6 | Notificações por E-mail | 5 |
| 7 | Dashboard | 5 |
| 8 | Relatório e Exportação | 4, 5 |
| 9 | Qualidade e Polimento | 3, 4, 5, 6, 7, 8 |
| 10 | Deploy | 9 |
