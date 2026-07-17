-- Ensure a character can never have more than one open (unresolved) pending skill choice at once
CREATE UNIQUE INDEX "PendingSkillChoice_characterId_open_unique" ON "PendingSkillChoice"("characterId") WHERE "resolvedAt" IS NULL;
