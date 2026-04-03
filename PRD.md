# PRD — Lista de Chamada

## 1. Visão Geral

**Lista de Chamada** é um sistema web para gestão de frequência escolar. Permite que administradores registrem presenças de alunos por turma e data, acompanhem o histórico de frequência, exportem relatórios e recebam alertas automáticos quando um aluno atinge situação irregular.

---

## 2. Problema

Escolas que registram chamadas manualmente (papel ou planilhas) não têm visibilidade em tempo real sobre a frequência dos alunos. Responsáveis são notificados tarde — ou nunca — quando o aluno está em risco de reprovação por falta.

---

## 3. Objetivos

- Digitalizar o registro de chamada
- Calcular frequência automaticamente
- Alertar responsáveis quando a frequência cair abaixo de 75%
- Gerar relatórios individuais exportáveis

---

## 4. Usuários

| Perfil | Descrição |
|--------|-----------|
| Administrador | Único perfil do sistema. Gerencia turmas, alunos e registra chamadas. |
| Responsável | Não acessa o sistema. Recebe alertas por e-mail. |

---

## 5. Módulos e Funcionalidades

### 5.1 Autenticação
- Login com e-mail e senha (bcrypt)
- Sessão JWT via NextAuth
- Redirecionamento automático para `/dashboard` após login
- Proteção de todas as rotas internas

### 5.2 Dashboard
- Totais do dia: presentes, ausentes, atrasados
- Lista de alunos em situação irregular (frequência < 75%)
- Botão "Notificar todos" para enviar alertas em massa a todos os irregulares
- Exportação em PDF da lista de alunos irregulares
- Filtro por data
- Dados carregados no servidor

### 5.3 Turmas
- Listagem de turmas em lista vertical com ações individuais
- Criação via modal (NovaTurmaModal)
- Edição via modal (EditarTurmaModal)
- Relatório de turma acessível via modal (RelatorioTurmaModal) com carregamento sob demanda
- Exclusão bloqueada se houver alunos vinculados
- Validação com Zod

### 5.4 Alunos
- Listagem com busca por nome ou matrícula
- Ordenação por qualquer coluna (asc/desc) com ícones de direção
- Frequência calculada no servidor e exibida como badge de situação na listagem
- Criação via modal (NovoAlunoModal)
- Edição via modal (EditarAlunoModal)
- Upload de foto via Cloudinary (limite: 5MB)
- Soft-delete: desativar aluno define `status = INATIVO`, mantém histórico, aluno vai ao fim da lista
- Status do aluno: ATIVO, PENDENTE, INATIVO
- Matrícula única garantida em duas camadas: constraint no banco (`@unique`) e tratamento do erro `P2002`
- Botão "Notificar" individual para disparar alerta manualmente ao responsável

### 5.5 Registro de Chamada
- Seleção de turma e data (atualização automática via URL)
- Carregamento dos alunos ativos da turma selecionada
- Marcação de status por aluno: Presente, Ausente, Atrasado
- Contadores em tempo real de presentes, ausentes e atrasados durante o preenchimento
- Pré-preenchimento quando a chamada do dia já foi salva
- Upsert para evitar duplicatas (`@@unique([alunoId, data, turmaId])`)
- Disparo de alerta de frequência após salvar

### 5.6 Histórico de Presenças
- Listagem com filtros: aluno, turma, status, intervalo de datas
- Paginação

### 5.7 Relatório Individual do Aluno
- Percentual de frequência
- Situação: Regular (≥ 75%) ou Irregular (< 75%)
- Contagem de presentes, atrasados e ausentes
- Calendário visual mensal com bolinhas coloridas por status
- Exportação em PDF e CSV

### 5.8 Alertas de Frequência
- **Automático**: enviado por e-mail (Resend) ao responsável quando o aluno entra em situação Irregular
- **Manual individual**: botão "Notificar" no dashboard ou na ficha do aluno, disponível para qualquer aluno irregular
- **Manual em massa**: botão "Notificar todos" no dashboard envia alertas a todos os irregulares de uma vez
- Alertas automáticos não reenviados enquanto o aluno continuar Irregular (`alertaEnviado = true`)
- Flag resetada quando o aluno volta a Regular

### 5.9 Exportações
- PDF individual por aluno (relatório de frequência)
- CSV individual por aluno
- PDF da lista de alunos irregulares (`/api/relatorio/irregulares/pdf`)

---

## 6. Regras de Negócio

| Regra | Detalhe |
|-------|---------|
| Frequência | PRESENTE e ATRASADO contam como presença. AUSENTE não conta. |
| Situação Regular | Frequência ≥ 75% |
| Situação Irregular | Frequência < 75% |
| Aluno sem registros | Tratado como 100% para não aparecer como irregular |
| Unicidade de presença | Um aluno só pode ter um registro por dia por turma |
| Exclusão de turma | Bloqueada se houver alunos vinculados |
| Desativação de aluno | Soft-delete: `status = INATIVO`, histórico preservado, aluno vai ao fim da lista |
| Cascata | Excluir aluno remove todas as suas presenças automaticamente |
| Alunos inativos | Não participam de chamadas |

---

## 7. Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Linguagem | TypeScript |
| Banco | PostgreSQL via Prisma 7 |
| Autenticação | NextAuth 5 (JWT) |
| Estilização | TailwindCSS 4 + shadcn/ui |
| Validação | Zod + React Hook Form |
| E-mail | Resend |
| Armazenamento de fotos | Cloudinary |
| PDF | @react-pdf/renderer |
| CSV | PapaParse |
| Notificações | Sonner (toasts) |

---

## 8. Arquitetura

```
Navegador
   ↓ Server Components (busca dados no servidor)
   ↓ Client Components (interação, formulários)
   ↓ Server Actions (mutações, validação)
   ↓ Prisma ORM
   ↓ PostgreSQL
```

- Páginas são Server Components por padrão — dados buscados direto no banco
- Mutações via Server Actions (`"use server"`)
- Revalidação de cache cirúrgica após cada mutação
- Error boundaries via `error.tsx` com mensagens amigáveis
- Fluxos de criação/edição de turmas e criação de alunos via modais, sem navegação de página

---

## 9. Schema de Dados

```
User        — id, nome, email, senha (bcrypt), role (ADMIN)
Turma       — id, nome, turno (MANHA|TARDE|NOITE), anoLetivo
Aluno       — id, nome, matricula (unique), turmaId, emailResponsavel,
              fotoUrl, fotoPublicId, status (ATIVO|PENDENTE|INATIVO),
              alertaEnviado (bool)
Presenca    — id, alunoId, turmaId, data, status (PRESENTE|AUSENTE|ATRASADO)
              @@unique([alunoId, data, turmaId])
```

---

## 10. Integrações Externas

| Serviço | Finalidade | Variável de ambiente |
|---------|-----------|----------------------|
| PostgreSQL | Banco de dados | `DATABASE_URL` |
| Cloudinary | Upload de fotos | `CLOUDINARY_*` |
| Resend | Envio de e-mails | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| NextAuth | Autenticação | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |

---

## 11. Fora do Escopo (versão atual)

- Múltiplos perfis de usuário (professores, coordenadores)
- Portal do responsável
- Notificações push ou SMS
- Integração com sistemas de gestão escolar externos
- Lançamento de notas