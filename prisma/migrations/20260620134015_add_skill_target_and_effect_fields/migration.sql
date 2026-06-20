-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('SINGLE_ENEMY', 'AOE_ENEMIES', 'SINGLE_ALLY', 'ALL_ALLIES', 'SELF');

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "damageMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "healMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "targetEffectDuration" INTEGER,
ADD COLUMN     "targetEffectStat" "StatType",
ADD COLUMN     "targetEffectValue" DOUBLE PRECISION,
ADD COLUMN     "targetType" "TargetType" NOT NULL DEFAULT 'SINGLE_ENEMY';
