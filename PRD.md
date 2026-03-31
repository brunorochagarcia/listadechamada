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
- Filtro por data
- Dados carregados no servidor

### 5.3 Turmas
- Listagem de turmas
- Criação e edição (nome, turno, ano letivo)
- Exclusão bloqueada se houver alunos vinculados
- Validação com Zod

### 5.4 Alunos
- Listagem com busca por nome ou matrícula
- Criação e edição (nome, matrícula, turma, e-mail do responsável, foto)
- Upload de foto via Cloudinary (limite: 5MB)
- Exclusão com diálogo de confirmação — alerta se o aluno tiver histórico de presenças
- Matrícula única garantida em duas camadas: constraint no banco (`@unique`) e tratamento do erro `P2002`

### 5.5 Registro de Chamada
- Seleção de turma e data (atualização automática via URL)
- Carregamento dos alunos da turma selecionada
- Marcação de status por aluno: Presente, Ausente, Atrasado
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
- Enviados automaticamente por e-mail (Resend) ao responsável
- Disparados quando o aluno entra em situação Irregular
- Não reenviados enquanto o aluno continuar Irregular (`alertaEnviado = true`)
- Flag resetada quando o aluno volta a Regular

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
| Exclusão de aluno | Permitida, mas com aviso se houver histórico de presenças |
| Cascata | Excluir aluno remove todas as suas presenças automaticamente |

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

---

## 9. Integrações Externas

| Serviço | Finalidade | Variável de ambiente |
|---------|-----------|----------------------|
| PostgreSQL | Banco de dados | `DATABASE_URL` |
| Cloudinary | Upload de fotos | `CLOUDINARY_*` |
| Resend | Envio de e-mails | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| NextAuth | Autenticação | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |

---

## 10. Fora do Escopo (versão atual)

- Múltiplos perfis de usuário (professores, coordenadores)
- Portal do responsável
- Notificações push ou SMS
- Integração com sistemas de gestão escolar externos
- Lançamento de notas