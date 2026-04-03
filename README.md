# Lista de Chamada

Sistema web para gestão de frequência escolar. Permite registrar chamadas por turma e data, acompanhar o histórico de frequência dos alunos e enviar alertas automáticos aos responsáveis quando a frequência cai abaixo de 75%.

## Funcionalidades

- Registro de chamada por turma e data (presente, ausente, atrasado) com contadores em tempo real
- Cálculo automático de frequência por aluno (exibido como badge na listagem)
- Alerta automático por e-mail ao responsável quando o aluno entra em situação irregular (< 75%)
- Notificação manual individual ou em massa diretamente pelo dashboard
- Relatório individual com calendário visual de presenças
- Exportação de relatório em PDF e CSV (individual e lista de irregulares)
- Gestão de turmas e alunos com upload de foto
- Criação e edição de turmas e alunos via modal (sem sair da listagem)
- Relatório de turma acessível via modal com carregamento sob demanda
- Soft-delete de alunos: desativação mantém o histórico, aluno inativo aparece ao fim da lista
- Tabela de alunos com ordenação por coluna (asc/desc)
- Dashboard com resumo diário e alunos em situação irregular

## Stack

- **Framework**: Next.js 16 (App Router)
- **Banco de dados**: PostgreSQL + Prisma
- **Autenticação**: NextAuth 5
- **Estilização**: TailwindCSS 4 + shadcn/ui
- **E-mail**: Resend
- **Armazenamento de fotos**: Cloudinary
- **Validação**: Zod + React Hook Form

## Pré-requisitos

- Node.js 18+
- PostgreSQL
- Conta no [Cloudinary](https://cloudinary.com) (fotos)
- Conta no [Resend](https://resend.com) (e-mails)

## Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencha o .env com suas credenciais

# 3. Criar as tabelas no banco
npx prisma migrate dev

# 4. (Opcional) Popular com dados de exemplo
npx prisma db seed

# 5. Iniciar o servidor
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:password@localhost:5432/listadechamada

NEXTAUTH_SECRET=seu-secret-aqui
NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@seudominio.com
```

## Estrutura de Pastas

```
app/
  (dashboard)/       # Páginas protegidas
    dashboard/       # Visão geral do dia
    turmas/          # Gestão de turmas
    alunos/          # Gestão de alunos
    presencas/       # Registro de chamada e histórico
  api/
    relatorio/       # Exportação PDF e CSV (individual e irregulares)
  login/             # Autenticação
components/          # Componentes reutilizáveis
lib/
  api/               # Queries ao banco
  email/             # Templates e envio de e-mail
  utils/             # Funções utilitárias (frequência, etc)
prisma/
  schema.prisma      # Modelo de dados
```

## Regras de Negócio

- Frequência = (presenças + atrasos) / total de registros
- Situação **Regular**: frequência ≥ 75%
- Situação **Irregular**: frequência < 75% — dispara alerta ao responsável
- Aluno sem registros é tratado como 100% (não aparece como irregular)
- Não é possível ter dois registros de presença para o mesmo aluno no mesmo dia e turma
- Alunos desativados (INATIVO) não participam de chamadas e ficam ao fim da lista
