-- CreateEnum
CREATE TYPE "StatusAluno" AS ENUM ('ATIVO', 'PENDENTE');

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "status" "StatusAluno" NOT NULL DEFAULT 'ATIVO';
