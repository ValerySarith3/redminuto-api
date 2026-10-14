-- Novedades de impacto por campaña.
CREATE TABLE `NovedadCampana` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(150) NOT NULL,
    `contenido` TEXT NOT NULL,
    `campanaId` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `NovedadCampana_campanaId_creadoEn_idx`(`campanaId`, `creadoEn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `NovedadCampana` ADD CONSTRAINT `NovedadCampana_campanaId_fkey` FOREIGN KEY (`campanaId`) REFERENCES `Campana`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
