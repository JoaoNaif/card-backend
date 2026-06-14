/*
  Warnings:

  - You are about to drop the column `cost` on the `Skill` table. All the data in the column will be lost.
  - Added the required column `pillar` to the `Power` table without a default value. This is not possible if the table is not empty.
  - Added the required column `debuffDuration` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `debuffStat` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `debuffValue` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Pillar" AS ENUM ('MATERIAL', 'VETORIAL', 'BIOLOGICA', 'PSIQUICA', 'FUNDAMENTAL');

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "awakenedPowerId" TEXT,
ADD COLUMN     "secondaryPowerId" TEXT;

-- AlterTable
ALTER TABLE "Power" ADD COLUMN     "canAwaken" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pillar" "Pillar" NOT NULL;

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "cost",
ADD COLUMN     "debuffDuration" INTEGER NOT NULL,
ADD COLUMN     "debuffStat" "StatType" NOT NULL,
ADD COLUMN     "debuffValue" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "PowerAwakening" (
    "id" TEXT NOT NULL,
    "basePowerId" TEXT NOT NULL,
    "awakenedPowerId" TEXT NOT NULL,

    CONSTRAINT "PowerAwakening_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PowerAwakening_basePowerId_awakenedPowerId_key" ON "PowerAwakening"("basePowerId", "awakenedPowerId");

-- AddForeignKey
ALTER TABLE "PowerAwakening" ADD CONSTRAINT "PowerAwakening_basePowerId_fkey" FOREIGN KEY ("basePowerId") REFERENCES "Power"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerAwakening" ADD CONSTRAINT "PowerAwakening_awakenedPowerId_fkey" FOREIGN KEY ("awakenedPowerId") REFERENCES "Power"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_secondaryPowerId_fkey" FOREIGN KEY ("secondaryPowerId") REFERENCES "Power"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_awakenedPowerId_fkey" FOREIGN KEY ("awakenedPowerId") REFERENCES "Power"("id") ON DELETE SET NULL ON UPDATE CASCADE;
