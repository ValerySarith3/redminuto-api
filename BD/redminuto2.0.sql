-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.4.3 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para redminuto
CREATE DATABASE IF NOT EXISTS `redminuto` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `redminuto`;

-- Volcando estructura para tabla redminuto.actividad
CREATE TABLE IF NOT EXISTS `actividad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `horaInicio` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `horaFin` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lugar` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cupo` int NOT NULL,
  `programaId` int NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Actividad_programaId_fkey` (`programaId`),
  CONSTRAINT `Actividad_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.actividad: ~0 rows (aproximadamente)
INSERT INTO `actividad` (`id`, `titulo`, `descripcion`, `fecha`, `horaInicio`, `horaFin`, `lugar`, `cupo`, `programaId`, `creadoEn`) VALUES
	(2, 'Prueba', 'prueba de actividad ', '2026-09-30', '08:00', '12:00', 'Casa Minuto de Dios', 10, 3, '2026-09-29 19:32:20.781');

-- Volcando estructura para tabla redminuto.campana
CREATE TABLE IF NOT EXISTS `campana` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `metaMonto` decimal(12,2) NOT NULL,
  `programaId` int NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Campana_programaId_fkey` (`programaId`),
  CONSTRAINT `Campana_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.campana: ~2 rows (aproximadamente)
INSERT INTO `campana` (`id`, `titulo`, `descripcion`, `metaMonto`, `programaId`, `creadoEn`) VALUES
	(1, 'Mercados de fin de año', 'Mercados navideños para 100 familias.', 8000000.00, 3, '2026-09-13 00:26:06.284'),
	(2, 'Útiles escolares 2027', 'Kits escolares para niños del programa.', 5000000.00, 4, '2026-09-13 00:26:06.489');

-- Volcando estructura para tabla redminuto.consentimientodatos
CREATE TABLE IF NOT EXISTS `consentimientodatos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `finalidad` enum('REGISTRO','SOLICITUD_AYUDA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `versionPolitica` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuarioId` int NOT NULL,
  `aceptadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ConsentimientoDatos_usuarioId_fkey` (`usuarioId`),
  CONSTRAINT `ConsentimientoDatos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.consentimientodatos: ~0 rows (aproximadamente)
INSERT INTO `consentimientodatos` (`id`, `finalidad`, `versionPolitica`, `usuarioId`, `aceptadoEn`) VALUES
	(3, 'REGISTRO', '2026-09', 7, '2026-09-29 19:11:00.468');

-- Volcando estructura para tabla redminuto.donacion
CREATE TABLE IF NOT EXISTS `donacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `monto` decimal(12,2) NOT NULL,
  `canal` enum('PASARELA','TRANSFERENCIA','EFECTIVO','LLAVE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('PENDIENTE','COMPLETADA','FALLIDA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `campanaId` int NOT NULL,
  `donanteId` int DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Donacion_campanaId_fkey` (`campanaId`),
  KEY `Donacion_donanteId_fkey` (`donanteId`),
  CONSTRAINT `Donacion_campanaId_fkey` FOREIGN KEY (`campanaId`) REFERENCES `campana` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Donacion_donanteId_fkey` FOREIGN KEY (`donanteId`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.donacion: ~0 rows (aproximadamente)
INSERT INTO `donacion` (`id`, `monto`, `canal`, `estado`, `campanaId`, `donanteId`, `creadoEn`) VALUES
	(1, 50000.00, 'PASARELA', 'COMPLETADA', 1, 3, '2026-09-13 00:28:27.045'),
	(4, 205000.00, 'PASARELA', 'COMPLETADA', 1, 7, '2026-09-29 19:14:54.791');

-- Volcando estructura para tabla redminuto.historialestado
CREATE TABLE IF NOT EXISTS `historialestado` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entidad` enum('DONACION','INSCRIPCION','SOLICITUD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entidadId` int NOT NULL,
  `estadoAnterior` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estadoNuevo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nota` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuarioId` int DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `HistorialEstado_entidad_entidadId_idx` (`entidad`,`entidadId`),
  KEY `HistorialEstado_usuarioId_fkey` (`usuarioId`),
  CONSTRAINT `HistorialEstado_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.historialestado: ~2 rows (aproximadamente)
INSERT INTO `historialestado` (`id`, `entidad`, `entidadId`, `estadoAnterior`, `estadoNuevo`, `nota`, `usuarioId`, `creadoEn`) VALUES
	(1, 'DONACION', 1, NULL, 'COMPLETADA', 'Registro previo a la bitácora', 3, '2026-09-13 00:28:27.045'),
	(2, 'INSCRIPCION', 1, NULL, 'PENDIENTE', 'Registro previo a la bitácora', 3, '2026-09-13 00:28:53.806'),
	(6, 'INSCRIPCION', 1, 'PENDIENTE', 'RECHAZADA', NULL, 2, '2026-09-29 16:30:09.982'),
	(9, 'DONACION', 4, NULL, 'PENDIENTE', 'Pago iniciado en PayU', 7, '2026-09-29 19:14:54.808'),
	(10, 'DONACION', 4, 'PENDIENTE', 'COMPLETADA', 'PayU: APPROVED (VISA) · Aprobada', NULL, '2026-09-29 19:21:04.469'),
	(11, 'INSCRIPCION', 3, NULL, 'PENDIENTE', 'Inscripción recibida', 7, '2026-09-29 19:42:05.005');

-- Volcando estructura para tabla redminuto.inscripcionvoluntario
CREATE TABLE IF NOT EXISTS `inscripcionvoluntario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estado` enum('PENDIENTE','ACEPTADA','RECHAZADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `voluntarioId` int NOT NULL,
  `programaId` int NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actividadId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `InscripcionVoluntario_voluntarioId_actividadId_key` (`voluntarioId`,`actividadId`),
  KEY `InscripcionVoluntario_programaId_fkey` (`programaId`),
  KEY `InscripcionVoluntario_actividadId_fkey` (`actividadId`),
  CONSTRAINT `InscripcionVoluntario_actividadId_fkey` FOREIGN KEY (`actividadId`) REFERENCES `actividad` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InscripcionVoluntario_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `InscripcionVoluntario_voluntarioId_fkey` FOREIGN KEY (`voluntarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.inscripcionvoluntario: ~0 rows (aproximadamente)
INSERT INTO `inscripcionvoluntario` (`id`, `estado`, `voluntarioId`, `programaId`, `creadoEn`, `actividadId`) VALUES
	(1, 'RECHAZADA', 3, 3, '2026-09-13 00:28:53.806', NULL),
	(3, 'PENDIENTE', 7, 3, '2026-09-29 19:42:04.996', 2);

-- Volcando estructura para tabla redminuto.logcambio
CREATE TABLE IF NOT EXISTS `logcambio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `modulo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exitoso` tinyint(1) NOT NULL DEFAULT '1',
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuarioId` int DEFAULT NULL,
  `ip` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `datosAnteriores` text COLLATE utf8mb4_unicode_ci,
  `datosNuevos` text COLLATE utf8mb4_unicode_ci,
  `afectadoTipo` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `afectadoNombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `LogCambio_creadoEn_idx` (`creadoEn`),
  KEY `LogCambio_modulo_idx` (`modulo`),
  KEY `LogCambio_usuarioId_fkey` (`usuarioId`),
  CONSTRAINT `LogCambio_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.logcambio: ~8 rows (aproximadamente)
INSERT INTO `logcambio` (`id`, `modulo`, `accion`, `exitoso`, `descripcion`, `usuarioId`, `ip`, `creadoEn`, `datosAnteriores`, `datosNuevos`, `afectadoTipo`, `afectadoNombre`) VALUES
	(4, 'CUENTAS', 'INICIO_SESION', 0, 'Intento de inicio de sesión con contraseña incorrecta', 1, '::1', '2026-09-29 19:09:57.230', NULL, NULL, 'Usuario', 'Ana Prueba (ana.prueba@example.com)'),
	(5, 'CUENTAS', 'INICIO_SESION', 0, 'Intento de inicio de sesión con contraseña incorrecta', 1, '::1', '2026-09-29 19:10:06.021', NULL, NULL, 'Usuario', 'Ana Prueba (ana.prueba@example.com)'),
	(6, 'CUENTAS', 'INICIO_SESION', 0, 'Intento de inicio de sesión con contraseña incorrecta', 1, '::1', '2026-09-29 19:10:06.820', NULL, NULL, 'Usuario', 'Ana Prueba (ana.prueba@example.com)'),
	(7, 'CUENTAS', 'INICIO_SESION', 0, 'Intento de inicio de sesión con contraseña incorrecta', 1, '::1', '2026-09-29 19:10:07.203', NULL, NULL, 'Usuario', 'Ana Prueba (ana.prueba@example.com)'),
	(8, 'CUENTAS', 'INICIO_SESION', 0, 'Intento de inicio de sesión con contraseña incorrecta', 1, '::1', '2026-09-29 19:10:07.615', NULL, NULL, 'Usuario', 'Ana Prueba (ana.prueba@example.com)'),
	(11, 'CUENTAS', 'REGISTRO', 1, 'Se registró en la plataforma con el correo lmartinez9a@gmail.com', 7, '::1', '2026-09-29 19:11:00.485', NULL, '{"Nombre":"Luisa Fernanda Martinez Rosero","Correo":"lmartinez9a@gmail.com"}', 'Usuario', 'Luisa Fernanda Martinez Rosero (lmartinez9a@gmail.com)'),
	(12, 'ACTIVIDADES', 'CREAR', 1, 'Creó la actividad «Prueba»', 2, '::1', '2026-09-29 19:32:20.795', NULL, '{"Título":"Prueba","Descripción":"prueba de actividad ","Fecha":"2026-09-30","Hora de inicio":"08:00","Hora de fin":"12:00","Lugar":"Casa Minuto de Dios","Cupo":"10","Programa":"Comedores comunitarios"}', 'Actividad', 'Prueba'),
	(13, 'CUENTAS', 'ACTUALIZAR_DATOS', 1, 'Actualizó sus datos de contacto', 7, '::1', '2026-09-29 19:42:04.962', '{"Celular":"—","Tipo de documento":"—","Número de documento":"—","Ciudad":"—"}', '{"Celular":"3118482726","Tipo de documento":"CC","Número de documento":"124355444","Ciudad":"BOGOTA"}', 'Usuario', 'Luisa Fernanda Martinez Rosero (lmartinez9a@gmail.com)');

-- Volcando estructura para tabla redminuto.pago
CREATE TABLE IF NOT EXISTS `pago` (
  `id` int NOT NULL AUTO_INCREMENT,
  `referencia` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metodo` enum('PASARELA','TRANSFERENCIA','EFECTIVO','LLAVE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('PENDIENTE','APROBADO','RECHAZADO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `respuestaPasarela` text COLLATE utf8mb4_unicode_ci,
  `donacionId` int NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Pago_referencia_key` (`referencia`),
  UNIQUE KEY `Pago_donacionId_key` (`donacionId`),
  CONSTRAINT `Pago_donacionId_fkey` FOREIGN KEY (`donacionId`) REFERENCES `donacion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.pago: ~0 rows (aproximadamente)
INSERT INTO `pago` (`id`, `referencia`, `metodo`, `estado`, `respuestaPasarela`, `donacionId`, `creadoEn`) VALUES
	(1, 'LEGADO-1', 'PASARELA', 'APROBADO', NULL, 1, '2026-09-13 00:28:27.045'),
	(4, 'RM-1790709294787-e246352c', 'PASARELA', 'APROBADO', '{"merchantId":"508029","merchant_name":"Test PayU","merchant_address":"Av 123 Calle 12","telephone":"7512354","merchant_url":"http://pruebaslapv.xtrweb.com","transactionState":"4","lapTransactionState":"APPROVED","message":"APPROVED","referenceCode":"RM-1790709294787-e246352c","reference_pol":"2158154888","transactionId":"1ec6298f-d1ca-4cf0-ae2f-5aaeb14d2700","description":"Donación a Mercados de fin de año","trazabilityCode":"202918960346","cus":"202918960346","orderLanguage":"es","extra1":"","extra2":"","extra3":"","polTransactionState":"4","signature":"140fa54752ad569d5d02e97a34e9df62","polResponseCode":"1","lapResponseCode":"APPROVED","risk":"","polPaymentMethod":"1071","lapPaymentMethod":"VISA","polPaymentMethodType":"2","lapPaymentMethodType":"CREDIT_CARD","installmentsNumber":"1","TX_VALUE":"205000.00","TX_TAX":".00","currency":"COP","lng":"es","pseCycle":"","buyerEmail":"lmartinez9a@gmail.com","pseBank":"","pseReference1":"","pseReference2":"","pseReference3":"","authorizationCode":["654321","654321"],"khipuBank":"","TX_ADMINISTRATIVE_FEE":".00","TX_TAX_ADMINISTRATIVE_FEE":".00","TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE":".00","processingDate":"2026-09-29"}', 4, '2026-09-29 19:14:54.804');

-- Volcando estructura para tabla redminuto.programa
CREATE TABLE IF NOT EXISTS `programa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `metaCupoVoluntarios` int NOT NULL DEFAULT '0',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.programa: ~2 rows (aproximadamente)
INSERT INTO `programa` (`id`, `nombre`, `descripcion`, `metaCupoVoluntarios`, `creadoEn`) VALUES
	(3, 'Comedores comunitarios', 'Alimentación semanal para familias en situación de vulnerabilidad.', 20, '2026-09-13 00:26:04.790'),
	(4, 'Educación para la vida', 'Refuerzo escolar y talleres para niños y jóvenes.', 15, '2026-09-13 00:26:05.062');

-- Volcando estructura para tabla redminuto.solicitudbeneficiario
CREATE TABLE IF NOT EXISTS `solicitudbeneficiario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('PENDIENTE','EN_REVISION','APROBADA','RECHAZADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `beneficiarioId` int NOT NULL,
  `programaId` int NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `tipoApoyo` enum('ALIMENTOS','SALUD','EDUCACION','VIVIENDA','EMPLEO','OTRO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTRO',
  `aceptaTratamientoDatos` tinyint(1) NOT NULL DEFAULT '0',
  `ciudad` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombreCompleto` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numeroDocumento` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `personasACargo` int NOT NULL DEFAULT '1',
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipoDocumento` enum('CC','TI','CE','PPT','RC','OTRO') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SolicitudBeneficiario_programaId_fkey` (`programaId`),
  KEY `SolicitudBeneficiario_beneficiarioId_fkey` (`beneficiarioId`),
  CONSTRAINT `SolicitudBeneficiario_beneficiarioId_fkey` FOREIGN KEY (`beneficiarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SolicitudBeneficiario_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.solicitudbeneficiario: ~0 rows (aproximadamente)

-- Volcando estructura para tabla redminuto.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('USUARIO','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoDocumento` enum('CC','TI','CE','PPT','RC','OTRO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numeroDocumento` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Usuario_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto.usuario: ~0 rows (aproximadamente)
INSERT INTO `usuario` (`id`, `nombre`, `email`, `passwordHash`, `rol`, `creadoEn`, `telefono`, `tipoDocumento`, `numeroDocumento`, `ciudad`) VALUES
	(1, 'Ana Prueba', 'ana.prueba@example.com', '$2b$10$OrQzfr3bwO7Bx5YMA3rd1.n0e0Gx4.jfs0dj2uMAsv.rbeIikLuFy', 'USUARIO', '2026-09-13 00:22:17.706', NULL, NULL, NULL, NULL),
	(2, 'Admin RedMinuto', 'admin@redminuto.test', '$2b$10$bWUe6gDpZa.dhgOCchaUtuRfEMr.wbErhksM8puzu76eAXyEz5Z8m', 'ADMIN', '2026-09-13 00:25:53.931', NULL, NULL, NULL, NULL),
	(3, 'Valeria Rios', 'valeria.rios@example.com', '$2b$10$uedsqvzOeeC4UKPglk2soeL6KgEsHa8jCaZo7mZQyxmZOyCrv5DLu', 'USUARIO', '2026-09-13 00:27:47.051', NULL, NULL, NULL, NULL),
	(7, 'Luisa Fernanda Martinez Rosero', 'lmartinez9a@gmail.com', '$2b$10$v888nwAlgxmX2QXg9xGx/eD/oW.zfz5uQ3UfppusULW0mUq05XdP6', 'USUARIO', '2026-09-29 19:11:00.468', '3118482726', 'CC', '124355444', 'BOGOTA');

-- Volcando estructura para tabla redminuto._prisma_migrations
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla redminuto._prisma_migrations: ~6 rows (aproximadamente)
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
	('6665e9f5-2529-4dde-83a2-5922641dab77', 'bdfd62f72da9083945c70bed49681d341109f84aaa365d9f1ecce3711df4bf07', '2026-09-29 18:37:41.398', '20260929180000_renombrar_log_cambios', NULL, NULL, '2026-09-29 18:37:41.089', 1),
	('6e163219-41e1-4a40-a367-6af1c06e39b7', 'de8485a0eb44ebf6fbf8ba37481a866660272e9626806db468bd77abbcaa20c8', '2026-09-25 13:05:28.225', '20260923173957_add_tipo_apoyo', NULL, NULL, '2026-09-25 13:05:28.214', 1),
	('77334ece-bfc6-4d3c-b592-abf3379262b7', '5fda9ede7edbfee4c69173ef9543e4cdc6af9854147a725b7a9dd1574a17a5bd', '2026-09-29 19:08:50.332', '20260929190000_log_cambios_afectado', NULL, NULL, '2026-09-29 19:08:50.250', 1),
	('899d2a79-8e44-4699-be45-38cff2b95286', '9791addc0c44b18e5e1aef67cc93ca2c3f0740f5a71e539ce2f9567f1a5b1569', '2026-09-13 00:08:27.536', '20260913000827_init', NULL, NULL, '2026-09-13 00:08:27.219', 1),
	('8e7a1074-27ad-4f4c-a824-53774d47da60', '9062c0a22f77e5ed2485f67e714f5a3579a4296d2a1bf14a455cf6d3716f3e7c', '2026-09-25 13:05:28.237', '20260923183344_add_datos_solicitud_beneficiario', NULL, NULL, '2026-09-25 13:05:28.226', 1),
	('b011f0f9-4dfa-4685-ad07-0be747ec0c7a', 'ed92cc404a945b9678b0d9fd2d3ebf4964ea5e13737398942e5f8871b1064cff', '2026-09-25 13:43:23.787', '20260925180000_rol_usuario_unico', NULL, NULL, '2026-09-25 13:43:23.715', 1),
	('c24ff865-23ff-42aa-85c5-80555546b093', '2d6f55f898f50d5d9fa178facf275b5c02313857886905badbf2243bf4e2812c', '2026-09-29 16:07:41.389', '20260929120000_datos_contacto_usuario', NULL, NULL, '2026-09-29 16:07:41.296', 1),
	('cd78c008-7d81-4d26-98f7-d95bb74212c2', 'de2fc6a5935503aed176a7763875d6e829a1e1d8eaa0a0368bea11b125713898', '2026-09-29 18:30:15.503', '20260929170000_auditoria_datos', NULL, NULL, '2026-09-29 18:30:15.434', 1),
	('d4afe603-bfc9-4eb2-bb49-58aad6d254f3', '4fd23e5cc262d4591e76dbfed7af4d74dc1ab31e4f4e0ed1a011a2d188367776', '2026-09-25 13:05:28.336', '20260923191234_cascade_borrado_usuario', NULL, NULL, '2026-09-25 13:05:28.239', 1),
	('ea76631a-653c-4a50-9d8b-10310d765615', 'b4a36cb55e40978041cb9521ee902f94cb52b4e50495dc17740e802a80fd84cc', '2026-09-29 16:25:16.813', '20260929150000_auditoria', NULL, NULL, '2026-09-29 16:25:16.610', 1),
	('fa686a3d-e16d-4af3-ba89-bda9c8c66750', '041312646b7d994fd76797ff03576ab023eb64e9930f00cf90ed29fd8057b27a', '2026-09-25 13:06:49.117', '20260925130000_trazabilidad_actividades_pagos_consentimiento', NULL, NULL, '2026-09-25 13:06:48.757', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
