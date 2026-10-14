-- 1) Listas maestras: catálogos que el administrador puede ampliar sin tocar código.
CREATE TABLE `ListaMaestra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ListaMaestra_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `OpcionListaMaestra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `listaMaestraId` INTEGER NOT NULL,
    `codigo` VARCHAR(30) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `OpcionListaMaestra_listaMaestraId_codigo_key`(`listaMaestraId`, `codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `OpcionListaMaestra` ADD CONSTRAINT `OpcionListaMaestra_listaMaestraId_fkey` FOREIGN KEY (`listaMaestraId`) REFERENCES `ListaMaestra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `ListaMaestra` (`codigo`, `nombre`, `descripcion`)
VALUES ('TIPO_DOCUMENTO', 'Tipos de documento', 'Documentos de identidad aceptados para usuarios y solicitudes de ayuda');

INSERT INTO `OpcionListaMaestra` (`listaMaestraId`, `codigo`, `nombre`, `orden`)
SELECT l.`id`, o.`codigo`, o.`nombre`, o.`orden`
FROM `ListaMaestra` l
JOIN (
    SELECT 'CC' AS `codigo`, 'Cédula de ciudadanía' AS `nombre`, 1 AS `orden`
    UNION ALL SELECT 'TI', 'Tarjeta de identidad', 2
    UNION ALL SELECT 'CE', 'Cédula de extranjería', 3
    UNION ALL SELECT 'PPT', 'Permiso por Protección Temporal', 4
    UNION ALL SELECT 'RC', 'Registro civil', 5
    UNION ALL SELECT 'OTRO', 'Otro', 6
) o
WHERE l.`codigo` = 'TIPO_DOCUMENTO';

-- 2) El tipo de documento pasa de ENUM a llave foránea hacia la lista maestra (se conservan los datos).
ALTER TABLE `Usuario` ADD COLUMN `tipoDocumentoId` INTEGER NULL;
ALTER TABLE `SolicitudBeneficiario` ADD COLUMN `tipoDocumentoId` INTEGER NULL;

UPDATE `Usuario` u
JOIN `OpcionListaMaestra` o ON o.`codigo` = u.`tipoDocumento`
JOIN `ListaMaestra` l ON l.`id` = o.`listaMaestraId` AND l.`codigo` = 'TIPO_DOCUMENTO'
SET u.`tipoDocumentoId` = o.`id`;

UPDATE `SolicitudBeneficiario` s
JOIN `OpcionListaMaestra` o ON o.`codigo` = s.`tipoDocumento`
JOIN `ListaMaestra` l ON l.`id` = o.`listaMaestraId` AND l.`codigo` = 'TIPO_DOCUMENTO'
SET s.`tipoDocumentoId` = o.`id`;

ALTER TABLE `Usuario` DROP COLUMN `tipoDocumento`;
ALTER TABLE `SolicitudBeneficiario` DROP COLUMN `tipoDocumento`;

-- 3) Orden de columnas: llave primaria → llaves foráneas → datos → estado → fechas.
ALTER TABLE `Usuario`
  MODIFY COLUMN `rol` enum('USUARIO','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `id`,
  MODIFY COLUMN `nombre` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `rol`,
  MODIFY COLUMN `telefono` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `nombre`,
  MODIFY COLUMN `tipoDocumentoId` int DEFAULT NULL AFTER `telefono`,
  MODIFY COLUMN `numeroDocumento` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `tipoDocumentoId`,
  MODIFY COLUMN `ciudad` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `numeroDocumento`,
  MODIFY COLUMN `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `ciudad`,
  MODIFY COLUMN `passwordHash` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `email`,
  MODIFY COLUMN `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `passwordHash`;

ALTER TABLE `Actividad`
  MODIFY COLUMN `programaId` int NOT NULL AFTER `id`,
  MODIFY COLUMN `titulo` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `programaId`,
  MODIFY COLUMN `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `titulo`,
  MODIFY COLUMN `fecha` date NOT NULL AFTER `descripcion`,
  MODIFY COLUMN `horaInicio` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `fecha`,
  MODIFY COLUMN `horaFin` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `horaInicio`,
  MODIFY COLUMN `lugar` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `horaFin`,
  MODIFY COLUMN `cupo` int NOT NULL AFTER `lugar`,
  MODIFY COLUMN `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `cupo`;

ALTER TABLE `Campana`
  MODIFY COLUMN `programaId` int NOT NULL AFTER `id`,
  MODIFY COLUMN `titulo` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `programaId`,
  MODIFY COLUMN `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `titulo`,
  MODIFY COLUMN `metaMonto` decimal(12,2) NOT NULL AFTER `descripcion`,
  MODIFY COLUMN `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `metaMonto`;

ALTER TABLE `NovedadCampana`
  MODIFY COLUMN `campanaId` int NOT NULL AFTER `id`,
  MODIFY COLUMN `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL AFTER `campanaId`,
  MODIFY COLUMN `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL AFTER `titulo`,
  MODIFY COLUMN `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `contenido`;

ALTER TABLE `Donacion`
  MODIFY COLUMN `campanaId` int NOT NULL AFTER `id`,
  MODIFY COLUMN `donanteId` int DEFAULT NULL AFTER `campanaId`,
  MODIFY COLUMN `monto` decimal(12,2) NOT NULL AFTER `donanteId`,
  MODIFY COLUMN `canal` enum('PASARELA','TRANSFERENCIA','EFECTIVO','LLAVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `monto`,
  MODIFY COLUMN `estado` enum('PENDIENTE','COMPLETADA','FALLIDA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE' AFTER `canal`,
  MODIFY COLUMN `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `estado`;

ALTER TABLE `Pago`
  MODIFY COLUMN `donacionId` int NOT NULL AFTER `id`,
  MODIFY COLUMN `referencia` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `donacionId`,
  MODIFY COLUMN `metodo` enum('PASARELA','TRANSFERENCIA','EFECTIVO','LLAVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `referencia`,
  MODIFY COLUMN `estado` enum('PENDIENTE','APROBADO','RECHAZADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `metodo`,
  MODIFY COLUMN `respuestaPasarela` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci AFTER `estado`,
  MODIFY COLUMN `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `respuestaPasarela`;

ALTER TABLE `InscripcionVoluntario`
  MODIFY COLUMN `voluntarioId` int NOT NULL AFTER `id`,
  MODIFY COLUMN `programaId` int NOT NULL AFTER `voluntarioId`,
  MODIFY COLUMN `actividadId` int DEFAULT NULL AFTER `programaId`,
  MODIFY COLUMN `estado` enum('PENDIENTE','ACEPTADA','RECHAZADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE' AFTER `actividadId`,
  MODIFY COLUMN `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `estado`;

ALTER TABLE `SolicitudBeneficiario`
  MODIFY COLUMN `beneficiarioId` int NOT NULL AFTER `id`,
  MODIFY COLUMN `programaId` int NOT NULL AFTER `beneficiarioId`,
  MODIFY COLUMN `tipoApoyo` enum('ALIMENTOS','SALUD','EDUCACION','VIVIENDA','EMPLEO','OTRO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTRO' AFTER `programaId`,
  MODIFY COLUMN `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `tipoApoyo`,
  MODIFY COLUMN `nombreCompleto` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `descripcion`,
  MODIFY COLUMN `tipoDocumentoId` int NOT NULL AFTER `nombreCompleto`,
  MODIFY COLUMN `numeroDocumento` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `tipoDocumentoId`,
  MODIFY COLUMN `telefono` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `numeroDocumento`,
  MODIFY COLUMN `direccion` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `telefono`,
  MODIFY COLUMN `ciudad` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `direccion`,
  MODIFY COLUMN `personasACargo` int NOT NULL DEFAULT '1' AFTER `ciudad`,
  MODIFY COLUMN `aceptaTratamientoDatos` tinyint(1) NOT NULL DEFAULT '0' AFTER `personasACargo`,
  MODIFY COLUMN `estado` enum('PENDIENTE','EN_REVISION','APROBADA','RECHAZADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE' AFTER `aceptaTratamientoDatos`,
  MODIFY COLUMN `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `estado`;

ALTER TABLE `HistorialEstado`
  MODIFY COLUMN `usuarioId` int DEFAULT NULL AFTER `id`,
  MODIFY COLUMN `entidad` enum('DONACION','INSCRIPCION','SOLICITUD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `usuarioId`,
  MODIFY COLUMN `entidadId` int NOT NULL AFTER `entidad`,
  MODIFY COLUMN `estadoAnterior` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `entidadId`,
  MODIFY COLUMN `estadoNuevo` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `estadoAnterior`,
  MODIFY COLUMN `nota` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `estadoNuevo`,
  MODIFY COLUMN `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `nota`;

ALTER TABLE `ConsentimientoDatos`
  MODIFY COLUMN `usuarioId` int NOT NULL AFTER `id`,
  MODIFY COLUMN `finalidad` enum('REGISTRO','SOLICITUD_AYUDA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `usuarioId`,
  MODIFY COLUMN `versionPolitica` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `finalidad`,
  MODIFY COLUMN `aceptadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `versionPolitica`;

ALTER TABLE `LogCambio`
  MODIFY COLUMN `usuarioId` int DEFAULT NULL AFTER `id`,
  MODIFY COLUMN `modulo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `usuarioId`,
  MODIFY COLUMN `accion` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `modulo`,
  MODIFY COLUMN `exitoso` tinyint(1) NOT NULL DEFAULT '1' AFTER `accion`,
  MODIFY COLUMN `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `exitoso`,
  MODIFY COLUMN `afectadoTipo` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `descripcion`,
  MODIFY COLUMN `afectadoNombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `afectadoTipo`,
  MODIFY COLUMN `datosAnteriores` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci AFTER `afectadoNombre`,
  MODIFY COLUMN `datosNuevos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci AFTER `datosAnteriores`,
  MODIFY COLUMN `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `datosNuevos`,
  MODIFY COLUMN `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `ip`;

-- 4) Llaves foráneas hacia la lista maestra. RESTRICT: una opción en uso no se puede borrar (se desactiva).
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_tipoDocumentoId_fkey` FOREIGN KEY (`tipoDocumentoId`) REFERENCES `OpcionListaMaestra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `SolicitudBeneficiario` ADD CONSTRAINT `SolicitudBeneficiario_tipoDocumentoId_fkey` FOREIGN KEY (`tipoDocumentoId`) REFERENCES `OpcionListaMaestra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
