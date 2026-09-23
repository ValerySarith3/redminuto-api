-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `rol` ENUM('DONANTE', 'VOLUNTARIO', 'BENEFICIARIO', 'ADMIN') NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Programa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `metaCupoVoluntarios` INTEGER NOT NULL DEFAULT 0,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campana` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `metaMonto` DECIMAL(12, 2) NOT NULL,
    `programaId` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Donacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monto` DECIMAL(12, 2) NOT NULL,
    `canal` ENUM('PASARELA', 'TRANSFERENCIA', 'EFECTIVO', 'LLAVE') NOT NULL,
    `estado` ENUM('PENDIENTE', 'COMPLETADA', 'FALLIDA') NOT NULL DEFAULT 'PENDIENTE',
    `campanaId` INTEGER NOT NULL,
    `donanteId` INTEGER NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InscripcionVoluntario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estado` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
    `voluntarioId` INTEGER NOT NULL,
    `programaId` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SolicitudBeneficiario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` TEXT NOT NULL,
    `estado` ENUM('PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
    `beneficiarioId` INTEGER NOT NULL,
    `programaId` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Campana` ADD CONSTRAINT `Campana_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `Programa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donacion` ADD CONSTRAINT `Donacion_campanaId_fkey` FOREIGN KEY (`campanaId`) REFERENCES `Campana`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donacion` ADD CONSTRAINT `Donacion_donanteId_fkey` FOREIGN KEY (`donanteId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InscripcionVoluntario` ADD CONSTRAINT `InscripcionVoluntario_voluntarioId_fkey` FOREIGN KEY (`voluntarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InscripcionVoluntario` ADD CONSTRAINT `InscripcionVoluntario_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `Programa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SolicitudBeneficiario` ADD CONSTRAINT `SolicitudBeneficiario_beneficiarioId_fkey` FOREIGN KEY (`beneficiarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SolicitudBeneficiario` ADD CONSTRAINT `SolicitudBeneficiario_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `Programa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
