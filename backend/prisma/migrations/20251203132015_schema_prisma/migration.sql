-- CreateTable
CREATE TABLE "ModuleCompletion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuleCompletion_userId_moduleId_key" ON "ModuleCompletion"("userId", "moduleId");

-- AddForeignKey
ALTER TABLE "ModuleCompletion" ADD CONSTRAINT "ModuleCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleCompletion" ADD CONSTRAINT "ModuleCompletion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
