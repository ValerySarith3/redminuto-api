/*
  Warnings:

  - Added the required column `ciudad` to the `SolicitudBeneficiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion` to the `SolicitudBeneficiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreCompleto` to the `SolicitudBeneficiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroDocumento` to the `SolicitudBeneficiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `SolicitudBeneficiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDocumento` to the `SolicitudBeneficiario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `solicitudbeneficiario` ADD COLUMN `aceptaTratamientoDatos` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `ciudad` VARCHAR(191) NOT NULL,
    ADD COLUMN `direccion` VARCHAR(191) NOT NULL,
    ADD COLUMN `nombreCompleto` VARCHAR(191) NOT NULL,
    ADD COLUMN `numeroDocumento` VARCHAR(191) NOT NULL,
    ADD COLUMN `personasACargo` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `telefono` VARCHAR(191) NOT NULL,
    ADD COLUMN `tipoDocumento` ENUM('CC', 'TI', 'CE', 'PPT', 'RC', 'OTRO') NOT NULL;
