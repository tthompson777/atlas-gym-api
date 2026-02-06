/*
  Warnings:

  - You are about to alter the column `role` on the `Usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `empresaId` to the `Transacao` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable - Step 1: Add column as nullable or with default
ALTER TABLE `Transacao` ADD COLUMN `empresaId` INTEGER DEFAULT 1;

-- Step 2: Update existing rows (redundant if DEFAULT is used, but good for safety)
UPDATE `Transacao` SET `empresaId` = 1 WHERE `empresaId` IS NULL;

-- Step 3: Make it NOT NULL
ALTER TABLE `Transacao` MODIFY `empresaId` INTEGER NOT NULL;

-- Step 4: Drop default if needed (optional, keeping it 1 is fine for now or drop it)
ALTER TABLE `Transacao` ALTER COLUMN `empresaId` DROP DEFAULT;

-- AlterTable (Usuario role change handling - keeping as generated but be aware of data loss if strings are not numeric)
ALTER TABLE `Usuario` MODIFY `role` INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `Transacao` ADD CONSTRAINT `Transacao_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `Empresa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
