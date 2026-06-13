-- CreateEnum
CREATE TYPE "StatType" AS ENUM ('HP', 'ATK', 'DEF', 'SPD');

-- CreateEnum
CREATE TYPE "BonusType" AS ENUM ('PERCENT', 'FLAT');

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "appliesBattleFieldId" TEXT,
ADD COLUMN     "fieldDuration" INTEGER;

-- CreateTable
CREATE TABLE "BattleField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleFieldModifier" (
    "id" TEXT NOT NULL,
    "battleFieldId" TEXT NOT NULL,
    "traitId" TEXT NOT NULL,
    "stat" "StatType" NOT NULL,
    "bonusType" "BonusType" NOT NULL,
    "bonusValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BattleFieldModifier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BattleField_name_key" ON "BattleField"("name");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_appliesBattleFieldId_fkey" FOREIGN KEY ("appliesBattleFieldId") REFERENCES "BattleField"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleFieldModifier" ADD CONSTRAINT "BattleFieldModifier_battleFieldId_fkey" FOREIGN KEY ("battleFieldId") REFERENCES "BattleField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleFieldModifier" ADD CONSTRAINT "BattleFieldModifier_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Trait"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
