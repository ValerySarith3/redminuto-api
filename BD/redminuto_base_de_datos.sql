-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: redminuto
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('6e163219-41e1-4a40-a367-6af1c06e39b7','de8485a0eb44ebf6fbf8ba37481a866660272e9626806db468bd77abbcaa20c8','2026-09-25 13:05:28.225','20260923173957_add_tipo_apoyo',NULL,NULL,'2026-09-25 13:05:28.214',1),('899d2a79-8e44-4699-be45-38cff2b95286','9791addc0c44b18e5e1aef67cc93ca2c3f0740f5a71e539ce2f9567f1a5b1569','2026-09-13 00:08:27.536','20260913000827_init',NULL,NULL,'2026-09-13 00:08:27.219',1),('8e7a1074-27ad-4f4c-a824-53774d47da60','9062c0a22f77e5ed2485f67e714f5a3579a4296d2a1bf14a455cf6d3716f3e7c','2026-09-25 13:05:28.237','20260923183344_add_datos_solicitud_beneficiario',NULL,NULL,'2026-09-25 13:05:28.226',1),('b011f0f9-4dfa-4685-ad07-0be747ec0c7a','ed92cc404a945b9678b0d9fd2d3ebf4964ea5e13737398942e5f8871b1064cff','2026-09-25 13:43:23.787','20260925180000_rol_usuario_unico',NULL,NULL,'2026-09-25 13:43:23.715',1),('d4afe603-bfc9-4eb2-bb49-58aad6d254f3','4fd23e5cc262d4591e76dbfed7af4d74dc1ab31e4f4e0ed1a011a2d188367776','2026-09-25 13:05:28.336','20260923191234_cascade_borrado_usuario',NULL,NULL,'2026-09-25 13:05:28.239',1),('fa686a3d-e16d-4af3-ba89-bda9c8c66750','041312646b7d994fd76797ff03576ab023eb64e9930f00cf90ed29fd8057b27a','2026-09-25 13:06:49.117','20260925130000_trazabilidad_actividades_pagos_consentimiento',NULL,NULL,'2026-09-25 13:06:48.757',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actividad`
--

DROP TABLE IF EXISTS `actividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `actividad` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha` date NOT NULL,
  `horaInicio` varchar(191) NOT NULL,
  `horaFin` varchar(191) NOT NULL,
  `lugar` varchar(191) NOT NULL,
  `cupo` int(11) NOT NULL,
  `programaId` int(11) NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Actividad_programaId_fkey` (`programaId`),
  CONSTRAINT `Actividad_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividad`
--

LOCK TABLES `actividad` WRITE;
/*!40000 ALTER TABLE `actividad` DISABLE KEYS */;
/*!40000 ALTER TABLE `actividad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campana`
--

DROP TABLE IF EXISTS `campana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campana` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) NOT NULL,
  `descripcion` text NOT NULL,
  `metaMonto` decimal(12,2) NOT NULL,
  `programaId` int(11) NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Campana_programaId_fkey` (`programaId`),
  CONSTRAINT `Campana_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campana`
--

LOCK TABLES `campana` WRITE;
/*!40000 ALTER TABLE `campana` DISABLE KEYS */;
INSERT INTO `campana` VALUES (1,'Mercados de fin de año','Mercados navideños para 100 familias.',8000000.00,3,'2026-09-13 00:26:06.284'),(2,'Útiles escolares 2027','Kits escolares para niños del programa.',5000000.00,4,'2026-09-13 00:26:06.489');
/*!40000 ALTER TABLE `campana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consentimientodatos`
--

DROP TABLE IF EXISTS `consentimientodatos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consentimientodatos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `finalidad` enum('REGISTRO','SOLICITUD_AYUDA') NOT NULL,
  `versionPolitica` varchar(191) NOT NULL,
  `usuarioId` int(11) NOT NULL,
  `aceptadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `ConsentimientoDatos_usuarioId_fkey` (`usuarioId`),
  CONSTRAINT `ConsentimientoDatos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consentimientodatos`
--

LOCK TABLES `consentimientodatos` WRITE;
/*!40000 ALTER TABLE `consentimientodatos` DISABLE KEYS */;
/*!40000 ALTER TABLE `consentimientodatos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donacion`
--

DROP TABLE IF EXISTS `donacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `donacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `monto` decimal(12,2) NOT NULL,
  `canal` enum('PASARELA','TRANSFERENCIA','EFECTIVO','LLAVE') NOT NULL,
  `estado` enum('PENDIENTE','COMPLETADA','FALLIDA') NOT NULL DEFAULT 'PENDIENTE',
  `campanaId` int(11) NOT NULL,
  `donanteId` int(11) DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Donacion_campanaId_fkey` (`campanaId`),
  KEY `Donacion_donanteId_fkey` (`donanteId`),
  CONSTRAINT `Donacion_campanaId_fkey` FOREIGN KEY (`campanaId`) REFERENCES `campana` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Donacion_donanteId_fkey` FOREIGN KEY (`donanteId`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donacion`
--

LOCK TABLES `donacion` WRITE;
/*!40000 ALTER TABLE `donacion` DISABLE KEYS */;
INSERT INTO `donacion` VALUES (1,50000.00,'PASARELA','COMPLETADA',1,3,'2026-09-13 00:28:27.045');
/*!40000 ALTER TABLE `donacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historialestado`
--

DROP TABLE IF EXISTS `historialestado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historialestado` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `entidad` enum('DONACION','INSCRIPCION','SOLICITUD') NOT NULL,
  `entidadId` int(11) NOT NULL,
  `estadoAnterior` varchar(191) DEFAULT NULL,
  `estadoNuevo` varchar(191) NOT NULL,
  `nota` varchar(191) DEFAULT NULL,
  `usuarioId` int(11) DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `HistorialEstado_entidad_entidadId_idx` (`entidad`,`entidadId`),
  KEY `HistorialEstado_usuarioId_fkey` (`usuarioId`),
  CONSTRAINT `HistorialEstado_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historialestado`
--

LOCK TABLES `historialestado` WRITE;
/*!40000 ALTER TABLE `historialestado` DISABLE KEYS */;
INSERT INTO `historialestado` VALUES (1,'DONACION',1,NULL,'COMPLETADA','Registro previo a la bitácora',3,'2026-09-13 00:28:27.045'),(2,'INSCRIPCION',1,NULL,'PENDIENTE','Registro previo a la bitácora',3,'2026-09-13 00:28:53.806');
/*!40000 ALTER TABLE `historialestado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inscripcionvoluntario`
--

DROP TABLE IF EXISTS `inscripcionvoluntario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inscripcionvoluntario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `estado` enum('PENDIENTE','ACEPTADA','RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
  `voluntarioId` int(11) NOT NULL,
  `programaId` int(11) NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `actividadId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `InscripcionVoluntario_voluntarioId_actividadId_key` (`voluntarioId`,`actividadId`),
  KEY `InscripcionVoluntario_programaId_fkey` (`programaId`),
  KEY `InscripcionVoluntario_actividadId_fkey` (`actividadId`),
  CONSTRAINT `InscripcionVoluntario_actividadId_fkey` FOREIGN KEY (`actividadId`) REFERENCES `actividad` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InscripcionVoluntario_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `InscripcionVoluntario_voluntarioId_fkey` FOREIGN KEY (`voluntarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripcionvoluntario`
--

LOCK TABLES `inscripcionvoluntario` WRITE;
/*!40000 ALTER TABLE `inscripcionvoluntario` DISABLE KEYS */;
INSERT INTO `inscripcionvoluntario` VALUES (1,'PENDIENTE',3,3,'2026-09-13 00:28:53.806',NULL);
/*!40000 ALTER TABLE `inscripcionvoluntario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pago` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `referencia` varchar(191) NOT NULL,
  `metodo` enum('PASARELA','TRANSFERENCIA','EFECTIVO','LLAVE') NOT NULL,
  `estado` enum('PENDIENTE','APROBADO','RECHAZADO') NOT NULL,
  `respuestaPasarela` text DEFAULT NULL,
  `donacionId` int(11) NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Pago_referencia_key` (`referencia`),
  UNIQUE KEY `Pago_donacionId_key` (`donacionId`),
  CONSTRAINT `Pago_donacionId_fkey` FOREIGN KEY (`donacionId`) REFERENCES `donacion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES (1,'LEGADO-1','PASARELA','APROBADO',NULL,1,'2026-09-13 00:28:27.045');
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programa`
--

DROP TABLE IF EXISTS `programa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) NOT NULL,
  `descripcion` text NOT NULL,
  `metaCupoVoluntarios` int(11) NOT NULL DEFAULT 0,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programa`
--

LOCK TABLES `programa` WRITE;
/*!40000 ALTER TABLE `programa` DISABLE KEYS */;
INSERT INTO `programa` VALUES (3,'Comedores comunitarios','Alimentación semanal para familias en situación de vulnerabilidad.',20,'2026-09-13 00:26:04.790'),(4,'Educación para la vida','Refuerzo escolar y talleres para niños y jóvenes.',15,'2026-09-13 00:26:05.062');
/*!40000 ALTER TABLE `programa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudbeneficiario`
--

DROP TABLE IF EXISTS `solicitudbeneficiario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `solicitudbeneficiario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` text NOT NULL,
  `estado` enum('PENDIENTE','EN_REVISION','APROBADA','RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
  `beneficiarioId` int(11) NOT NULL,
  `programaId` int(11) NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `tipoApoyo` enum('ALIMENTOS','SALUD','EDUCACION','VIVIENDA','EMPLEO','OTRO') NOT NULL DEFAULT 'OTRO',
  `aceptaTratamientoDatos` tinyint(1) NOT NULL DEFAULT 0,
  `ciudad` varchar(191) NOT NULL,
  `direccion` varchar(191) NOT NULL,
  `nombreCompleto` varchar(191) NOT NULL,
  `numeroDocumento` varchar(191) NOT NULL,
  `personasACargo` int(11) NOT NULL DEFAULT 1,
  `telefono` varchar(191) NOT NULL,
  `tipoDocumento` enum('CC','TI','CE','PPT','RC','OTRO') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SolicitudBeneficiario_programaId_fkey` (`programaId`),
  KEY `SolicitudBeneficiario_beneficiarioId_fkey` (`beneficiarioId`),
  CONSTRAINT `SolicitudBeneficiario_beneficiarioId_fkey` FOREIGN KEY (`beneficiarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SolicitudBeneficiario_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudbeneficiario`
--

LOCK TABLES `solicitudbeneficiario` WRITE;
/*!40000 ALTER TABLE `solicitudbeneficiario` DISABLE KEYS */;
/*!40000 ALTER TABLE `solicitudbeneficiario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `rol` enum('USUARIO','ADMIN') NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Usuario_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Ana Prueba','ana.prueba@example.com','$2b$10$OrQzfr3bwO7Bx5YMA3rd1.n0e0Gx4.jfs0dj2uMAsv.rbeIikLuFy','USUARIO','2026-09-13 00:22:17.706'),(2,'Admin RedMinuto','admin@redminuto.test','$2b$10$8lm7fkEqrdPN.OadjaRo/.NBYusT4Z8cwv0VYM3/z2Yro8FaByMIa','ADMIN','2026-09-13 00:25:53.931'),(3,'Valeria Rios','valeria.rios@example.com','$2b$10$uedsqvzOeeC4UKPglk2soeL6KgEsHa8jCaZo7mZQyxmZOyCrv5DLu','USUARIO','2026-09-13 00:27:47.051');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-25  8:54:07
