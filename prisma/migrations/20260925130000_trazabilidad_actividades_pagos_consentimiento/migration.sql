-- AlterTable
ALTER TABLE `inscripcionvoluntario` ADD COLUMN `actividadId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Actividad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `fecha` DATE NOT NULL,
    `horaInicio` VARCHAR(191) NOT NULL,
    `horaFin` VARCHAR(191) NOT NULL,
    `lugar` VARCHAR(191) NOT NULL,
    `cupo` INTEGER NOT NULL,
    `programaId` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pago` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `referencia` VARCHAR(191) NOT NULL,
    `metodo` ENUM('PASARELA', 'TRANSFERENCIA', 'EFECTIVO', 'LLAVE') NOT NULL,
    `estado` ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO') NOT NULL,
    `respuestaPasarela` TEXT NULL,
    `donacionId` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Pago_referencia_key`(`referencia`),
    UNIQUE INDEX `Pago_donacionId_key`(`donacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistorialEstado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entidad` ENUM('DONACION', 'INSCRIPCION', 'SOLICITUD') NOT NULL,
    `entidadId` INTEGER NOT NULL,
    `estadoAnterior` VARCHAR(191) NULL,
    `estadoNuevo` VARCHAR(191) NOT NULL,
    `nota` VARCHAR(191) NULL,
    `usuarioId` INTEGER NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HistorialEstado_entidad_entidadId_idx`(`entidad`, `entidadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConsentimientoDatos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `finalidad` ENUM('REGISTRO', 'SOLICITUD_AYUDA') NOT NULL,
    `versionPolitica` VARCHAR(191) NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `aceptadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `InscripcionVoluntario_voluntarioId_actividadId_key` ON `InscripcionVoluntario`(`voluntarioId`, `actividadId`);

-- AddForeignKey
ALTER TABLE `Actividad` ADD CONSTRAINT `Actividad_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `Programa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_donacionId_fkey` FOREIGN KEY (`donacionId`) REFERENCES `Donacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InscripcionVoluntario` ADD CONSTRAINT `InscripcionVoluntario_actividadId_fkey` FOREIGN KEY (`actividadId`) REFERENCES `Actividad`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialEstado` ADD CONSTRAINT `HistorialEstado_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsentimientoDatos` ADD CONSTRAINT `ConsentimientoDatos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

