-- CreateEnum
CREATE TYPE "AiDifficulty" AS ENUM ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO', 'ESPECIALISTA');

-- CreateEnum
CREATE TYPE "AiPersonality" AS ENUM ('EQUILIBRADO', 'MODERADO', 'OUSADO');

-- AlterTable
ALTER TABLE "Machine" ADD COLUMN     "difficulty" "AiDifficulty" NOT NULL DEFAULT 'INICIANTE',
ADD COLUMN     "personality" "AiPersonality" NOT NULL DEFAULT 'EQUILIBRADO';
