-- DropForeignKey
ALTER TABLE `inscripcionvoluntario` DROP FOREIGN KEY `InscripcionVoluntario_voluntarioId_fkey`;

-- DropForeignKey
ALTER TABLE `solicitudbeneficiario` DROP FOREIGN KEY `SolicitudBeneficiario_beneficiarioId_fkey`;

-- DropIndex
DROP INDEX `InscripcionVoluntario_voluntarioId_fkey` ON `inscripcionvoluntario`;

-- DropIndex
DROP INDEX `SolicitudBeneficiario_beneficiarioId_fkey` ON `solicitudbeneficiario`;

-- AddForeignKey
ALTER TABLE `InscripcionVoluntario` ADD CONSTRAINT `InscripcionVoluntario_voluntarioId_fkey` FOREIGN KEY (`voluntarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SolicitudBeneficiario` ADD CONSTRAINT `SolicitudBeneficiario_beneficiarioId_fkey` FOREIGN KEY (`beneficiarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
