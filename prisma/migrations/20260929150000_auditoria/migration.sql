-- Bitácora de auditoría de acciones sobre cuentas y contenido.
CREATE TABLE `Auditoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modulo` VARCHAR(30) NOT NULL,
    `accion` VARCHAR(40) NOT NULL,
    `exitoso` BOOLEAN NOT NULL DEFAULT true,
    `descripcion` TEXT NOT NULL,
    `usuarioId` INTEGER NULL,
    `ip` VARCHAR(64) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Auditoria_creadoEn_idx`(`creadoEn`),
    INDEX `Auditoria_modulo_idx`(`modulo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Auditoria` ADD CONSTRAINT `Auditoria_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
