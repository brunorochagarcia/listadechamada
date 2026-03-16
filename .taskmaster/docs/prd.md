# PRD — Aplicativo Web de Controle de Presença Escolar (v1.1)

---

## 1. Visão Geral do Produto

**Nome:** Lista de Chamada
**Tipo:** Aplicação Web — Painel Administrativo Escolar
**Objetivo:** Digitalizar e centralizar o controle de presença de alunos, oferecendo registro diário por turma, relatórios individuais exportáveis e dashboard com visão agregada. Arquitetado para suportar múltiplos usuários em versões futuras.

---

## 2. Contexto e Problema

Escolas que ainda utilizam planilhas ou registros físicos enfrentam dificuldade em acompanhar frequência em tempo real, identificar alunos em risco de reprovação por falta e notificar responsáveis proativamente. Este sistema resolve esses problemas com uma interface web moderna, registro simplificado para o professor e alertas automáticos por e-mail.

---

## 3. Usuários e Papéis

| Papel | Descrição |
|---|---|
| **Admin** | Único perfil na v1. Gerencia turmas, alunos, registra presenças e consulta relatórios. |

> Autenticação via NextAuth.js com credentials provider. Senha armazenada com bcrypt.
> **Decisão arquitetural:** o modelo de `User` deve ser projetado para suportar múltiplos usuários e diferentes roles no futuro (campo `role` na tabela, relação entre `User` e `Turma`). Na v1, apenas um usuário é cadastrado manualmente via seed.

---

## 4. Regras de Negócio

| # | Regra |
|---|---|
| RN-01 | Aluno com frequência **abaixo de 75%** é classificado como **Irregular**; acima ou igual, **Regular**. |
| RN-02 | Não é permitido registrar presença duplicada para o mesmo aluno na mesma **data + turma**. |
| RN-03 | O campo **matrícula** deve ser único no sistema. |
| RN-04 | Atrasos **contam como presença** no cálculo de frequência, mas são registrados com status distinto (`ATRASADO`). |
| RN-05 | Toda exclusão (turma, aluno, presença) deve ser confirmada via modal antes de persistir. |
| RN-06 | Fotos de alunos removidas devem ser excluídas também no Cloudinary via `publicId`. |
| RN-07 | Ao atingir frequência **abaixo de 75%**, um e-mail de alerta é enviado automaticamente ao **responsável do aluno** via Resend. |
| RN-08 | O e-mail de alerta deve ser enviado **uma única vez por ciclo de irregularidade** — não reenviar enquanto o aluno já estiver irregular. Reenviar apenas se o aluno retornar a Regular e cair novamente. |

---

## 5. Requisitos Funcionais

### 5.1 Gestão de Turmas

| ID | Requisito |
|---|---|
| RF-01 | Cadastrar turma com: nome/código (ex: `3A`), turno (Manhã/Tarde/Noite), ano letivo. |
| RF-02 | Editar e excluir turma (exclusão bloqueada se houver alunos ou presenças vinculadas). |
| RF-03 | Listar turmas cadastradas. |

### 5.2 Gestão de Alunos

| ID | Requisito |
|---|---|
| RF-04 | Cadastrar aluno com: nome, matrícula (único), turma (FK), email do responsável, foto (opcional via Cloudinary). |
| RF-05 | Editar dados do aluno, incluindo substituição de foto (remover anterior do Cloudinary via `publicId`). |
| RF-06 | Excluir aluno com confirmação em modal. |
| RF-07 | Listar alunos com busca por **nome** ou **matrícula**. |
| RF-08 | Exibir relatório individual: histórico de presenças, percentual de frequência, situação (Regular/Irregular), exportável em **PDF** e **CSV**. |

### 5.3 Registro de Presença

| ID | Requisito |
|---|---|
| RF-09 | Professor seleciona **data** e **turma** para abrir a chamada. |
| RF-10 | A lista de alunos é carregada automaticamente pela turma selecionada. |
| RF-11 | É possível buscar aluno por **nome ou matrícula** dentro da chamada aberta. |
| RF-12 | Para cada aluno, atribuir status: `PRESENTE`, `AUSENTE` ou `ATRASADO`. |
| RF-13 | Persistir presenças impedindo duplicatas (constraint única: `alunoId + data + turmaId`). |
| RF-14 | Permitir reabrir e corrigir chamada já registrada para a mesma data/turma. |

### 5.4 Histórico e Filtros

| ID | Requisito |
|---|---|
| RF-15 | Listar presenças com filtro por **data**, **turma** e **status**. |
| RF-16 | Paginação na listagem de histórico. |

### 5.5 Dashboard

| ID | Requisito |
|---|---|
| RF-17 | Exibir resumo do dia atual: total de **presentes**, **ausentes** e **atrasados**. |
| RF-18 | Agregação exibida por turma (cards separados). |
| RF-19 | Indicar alunos em situação Irregular no dashboard (destaque visual). |

### 5.6 Notificações por E-mail

| ID | Requisito |
|---|---|
| RF-20 | Ao registrar presença que faça o aluno cruzar o limiar de 75%, enviar e-mail ao responsável via Resend. |
| RF-21 | E-mail deve conter: nome do aluno, percentual atual de frequência, situação e orientações. |
| RF-22 | Controlar flag `alertaEnviado` no banco para evitar reenvio desnecessário (RN-08). |

### 5.7 Exportação de Relatórios

| ID | Requisito |
|---|---|
| RF-23 | Relatório individual exportável em **PDF** (layout formatado com dados do aluno e histórico). |
| RF-24 | Relatório individual exportável em **CSV** (dados tabulares para uso em planilhas). |

---

## 6. Requisitos Não Funcionais

| ID | Requisito |
|---|---|
| RNF-01 | Validação de todos os dados de entrada no servidor com **Zod**. |
| RNF-02 | Variáveis de ambiente tipadas e validadas via `lib/env.ts` com Zod. |
| RNF-03 | Feedback visual consistente via **toasts** (shadcn/ui). |
| RNF-04 | Código comentado nos trechos de lógica complexa (cálculo de frequência, deduplicação, disparo de e-mail). |
| RNF-05 | Aplicação responsiva (mobile-first com Tailwind CSS). |
| RNF-06 | Deploy contínuo via **Vercel**. |
| RNF-07 | Modelo de dados preparado para multi-usuário (campo `role`, relações extensíveis). |

---

## 7. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Linguagem | TypeScript (strict mode) |
| Banco de Dados | PostgreSQL + Prisma ORM |
| Autenticação | NextAuth.js (credentials provider) |
| UI | shadcn/ui + Tailwind CSS |
| Upload de Imagens | Cloudinary |
| E-mail | Resend |
| Exportação PDF | `@react-pdf/renderer` |
| Exportação CSV | `papaparse` |
| Deploy | Vercel |

---

## 8. Modelo de Dados

```prisma
model User {
  id        String   @id @default(cuid())
  nome      String
  email     String   @unique
  senha     String   // bcrypt hash
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Turma {
  id        String     @id @default(cuid())
  nome      String
  turno     Turno
  anoLetivo String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  alunos    Aluno[]
  presencas Presenca[]
}

model Aluno {
  id               String     @id @default(cuid())
  nome             String
  matricula        String     @unique
  turmaId          String
  emailResponsavel String
  fotoUrl          String?
  fotoPublicId     String?
  alertaEnviado    Boolean    @default(false)
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  turma            Turma      @relation(fields: [turmaId], references: [id])
  presencas        Presenca[]
}

model Presenca {
  id        String         @id @default(cuid())
  alunoId   String
  turmaId   String
  data      DateTime       @db.Date
  status    StatusPresenca
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
  aluno     Aluno          @relation(fields: [alunoId], references: [id], onDelete: Cascade)
  turma     Turma          @relation(fields: [turmaId], references: [id])

  @@unique([alunoId, data, turmaId])
}

enum Role           { ADMIN }
enum Turno          { MANHA TARDE NOITE }
enum StatusPresenca { PRESENTE AUSENTE ATRASADO }
```

---

## 9. Estrutura de Páginas e Componentes

```
app/
├── dashboard/page.tsx
├── turmas/
│   ├── page.tsx
│   ├── nova/page.tsx
│   └── [id]/editar/page.tsx
├── alunos/
│   ├── page.tsx
│   ├── novo/page.tsx
│   ├── [id]/page.tsx
│   └── [id]/editar/page.tsx
├── presencas/
│   ├── page.tsx
│   └── historico/page.tsx
└── api/
    └── relatorio/[id]/
        ├── pdf/route.ts
        └── csv/route.ts

components/
├── AlunoCard.tsx
├── PresencaForm.tsx
├── StatusBadge.tsx
├── FiltroPresenca.tsx
├── ConfirmModal.tsx
└── ExportButtons.tsx

lib/
├── api/
│   ├── turmas.ts
│   ├── alunos.ts
│   └── presencas.ts
├── email/
│   └── alertaFrequencia.ts
├── export/
│   ├── pdf.ts
│   └── csv.ts
├── env.ts
└── utils/
    └── frequencia.ts
```

---

## 10. Padrões de Implementação

- **Mutações** via **Server Actions** (criar, editar, excluir, registrar presença).
- **Listagens e detalhes** via **React Server Components**.
- **Confirmação em modal** obrigatória para toda operação de exclusão.
- **Disparo de e-mail** ocorre dentro da Server Action de registro de presença, após persistência, de forma assíncrona.
- **Exportação** gerada server-side via Route Handlers (`app/api/relatorio/[id]/pdf/route.ts` e `.../csv/route.ts`).
- **Senhas** sempre hashadas com bcrypt — nunca em texto plano.
- **Variáveis de ambiente** tipadas e validadas com Zod em `lib/env.ts`.

---

## 11. Fora de Escopo (v1)

- Múltiplos usuários com login independente (arquitetura preparada, funcionalidade na v2)
- App mobile nativo
- Integração com sistemas externos de gestão escolar
- Notificações push
- Importação em lote de alunos via CSV
- Relatório consolidado de turma exportável (apenas individual na v1)
