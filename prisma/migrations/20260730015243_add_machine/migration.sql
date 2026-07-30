-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineMember" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "positionRow" INTEGER NOT NULL,
    "positionCol" INTEGER NOT NULL,

    CONSTRAINT "MachineMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Machine_label_key" ON "Machine"("label");

-- CreateIndex
CREATE UNIQUE INDEX "MachineMember_machineId_positionRow_positionCol_key" ON "MachineMember"("machineId", "positionRow", "positionCol");

-- CreateIndex
CREATE UNIQUE INDEX "MachineMember_machineId_characterId_key" ON "MachineMember"("machineId", "characterId");

-- AddForeignKey
ALTER TABLE "MachineMember" ADD CONSTRAINT "MachineMember_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineMember" ADD CONSTRAINT "MachineMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
