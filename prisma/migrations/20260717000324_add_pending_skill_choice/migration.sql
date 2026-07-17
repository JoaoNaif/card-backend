-- CreateTable
CREATE TABLE "PendingSkillChoice" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "optionSkillIds" TEXT[],
    "chosenSkillId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "PendingSkillChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingSkillChoice_characterId_resolvedAt_idx" ON "PendingSkillChoice"("characterId", "resolvedAt");

-- AddForeignKey
ALTER TABLE "PendingSkillChoice" ADD CONSTRAINT "PendingSkillChoice_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
