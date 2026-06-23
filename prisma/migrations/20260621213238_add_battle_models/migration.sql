-- CreateEnum
CREATE TYPE "BattleMode" AS ENUM ('AUTO', 'PVE', 'PVP');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "mode" "BattleMode" NOT NULL,
    "status" "BattleStatus" NOT NULL DEFAULT 'COMPLETED',
    "battleFieldId" TEXT NOT NULL,
    "winnerTeam" INTEGER,
    "totalTurns" INTEGER NOT NULL DEFAULT 0,
    "maxTurns" INTEGER,
    "log" JSONB NOT NULL DEFAULT '[]',
    "sessionState" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleTeam" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "teamNumber" INTEGER NOT NULL,
    "userId" TEXT,

    CONSTRAINT "BattleTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleParticipant" (
    "id" TEXT NOT NULL,
    "battleTeamId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "positionRow" INTEGER NOT NULL,
    "positionCol" INTEGER NOT NULL,

    CONSTRAINT "BattleParticipant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_battleFieldId_fkey" FOREIGN KEY ("battleFieldId") REFERENCES "BattleField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleTeam" ADD CONSTRAINT "BattleTeam_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleTeam" ADD CONSTRAINT "BattleTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleParticipant" ADD CONSTRAINT "BattleParticipant_battleTeamId_fkey" FOREIGN KEY ("battleTeamId") REFERENCES "BattleTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleParticipant" ADD CONSTRAINT "BattleParticipant_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
