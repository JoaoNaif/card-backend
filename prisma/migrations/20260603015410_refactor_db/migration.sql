/*
  Warnings:

  - Added the required column `baseAtk` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseDef` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseHp` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseSpd` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxRanking` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minLevel` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `cost` on the `Skill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "baseAtk" INTEGER NOT NULL,
ADD COLUMN     "baseDef" INTEGER NOT NULL,
ADD COLUMN     "baseHp" INTEGER NOT NULL,
ADD COLUMN     "baseSpd" INTEGER NOT NULL,
ADD COLUMN     "breakthroughAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxRanking" "Ranking" NOT NULL,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "ranking" SET DEFAULT 'MORTAL';

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "minLevel" INTEGER NOT NULL,
DROP COLUMN "cost",
ADD COLUMN     "cost" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Trait" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSkill" (
    "characterId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterSkill_pkey" PRIMARY KEY ("characterId","skillId")
);

-- CreateTable
CREATE TABLE "_SkillToTrait" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SkillToTrait_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CharacterToTrait" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CharacterToTrait_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trait_name_key" ON "Trait"("name");

-- CreateIndex
CREATE INDEX "_SkillToTrait_B_index" ON "_SkillToTrait"("B");

-- CreateIndex
CREATE INDEX "_CharacterToTrait_B_index" ON "_CharacterToTrait"("B");

-- AddForeignKey
ALTER TABLE "CharacterSkill" ADD CONSTRAINT "CharacterSkill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSkill" ADD CONSTRAINT "CharacterSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SkillToTrait" ADD CONSTRAINT "_SkillToTrait_A_fkey" FOREIGN KEY ("A") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SkillToTrait" ADD CONSTRAINT "_SkillToTrait_B_fkey" FOREIGN KEY ("B") REFERENCES "Trait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToTrait" ADD CONSTRAINT "_CharacterToTrait_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToTrait" ADD CONSTRAINT "_CharacterToTrait_B_fkey" FOREIGN KEY ("B") REFERENCES "Trait"("id") ON DELETE CASCADE ON UPDATE CASCADE;
