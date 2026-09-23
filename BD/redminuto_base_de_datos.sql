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
INSERT INTO `_prisma_migrations` VALUES ('1a1ec9e1-4563-493b-9bbe-d1c0f5eeef9a','50b40f27a753a67f5c04a4ae171f0c11c818150a6f387f856b613a9502a37add','2026-09-23 18:33:44.471','20260923183344_add_datos_solicitud_beneficiario',NULL,NULL,'2026-09-23 18:33:44.403',1),('42452d37-592b-4f48-b730-b584265b37e4','54812232093459bb7c70ef125f9d5c5ea06cdaf16fa2263990ec984f15c5db5a','2026-09-23 19:12:34.992','20260923191234_cascade_borrado_usuario',NULL,NULL,'2026-09-23 19:12:34.872',1),('7c894707-d5e6-4481-8a18-be38272a419f','9791addc0c44b18e5e1aef67cc93ca2c3f0740f5a71e539ce2f9567f1a5b1569','2026-09-23 17:39:56.707','20260913000827_init',NULL,NULL,'2026-09-23 17:39:56.342',1),('bf08246b-5bd3-4ecd-88a5-7f1392d8bb71','5c6a74eb6bdb62e56ce7f47ae3318ddb1a71bfef0dad023a227c3f9ced16c315','2026-09-23 17:39:57.438','20260923173957_add_tipo_apoyo',NULL,NULL,'2026-09-23 17:39:57.427',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
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
INSERT INTO `campana` VALUES (2,'ayudas a familias','ayudanos',39001.00,4,'2026-09-23 19:35:21.524');
/*!40000 ALTER TABLE `campana` ENABLE KEYS */;
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
INSERT INTO `donacion` VALUES (2,20000.00,'PASARELA','COMPLETADA',2,11,'2026-09-23 19:36:11.471');
/*!40000 ALTER TABLE `donacion` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `InscripcionVoluntario_programaId_fkey` (`programaId`),
  KEY `InscripcionVoluntario_voluntarioId_fkey` (`voluntarioId`),
  CONSTRAINT `InscripcionVoluntario_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `InscripcionVoluntario_voluntarioId_fkey` FOREIGN KEY (`voluntarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripcionvoluntario`
--

LOCK TABLES `inscripcionvoluntario` WRITE;
/*!40000 ALTER TABLE `inscripcionvoluntario` DISABLE KEYS */;
INSERT INTO `inscripcionvoluntario` VALUES (3,'PENDIENTE',11,4,'2026-09-23 19:36:24.238');
/*!40000 ALTER TABLE `inscripcionvoluntario` ENABLE KEYS */;
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
INSERT INTO `programa` VALUES (4,'Apoyo Damnificados','Ayudas  a familias por terremoto',10,'2026-09-23 19:34:41.966');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `rol` enum('DONANTE','VOLUNTARIO','BENEFICIARIO','ADMIN') NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Usuario_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Administrador Casa Minuto de Dios','admin@casaminutodedios.org','$2b$10$9ViE3d8CV6GnVbr7zsdQG.JjNrfTeROQJZ0u7nGBILhXcxnkLDBwe','ADMIN','2026-09-23 17:46:23.466'),(10,'valery sarith zambrano rosero','valery123@gmail.com','$2b$10$w8htnSWsdwftkFr40vMhTeyIUdiNxXJM/dZxgRSe25zI0k4mVYrpy','DONANTE','2026-09-23 19:33:59.216'),(11,'dairon moreno','morenodairon78@gmail.com','$2b$10$EH8y3hJ1BiqOXCiIpUPZReoVTA.6tj4f7V1BIVpcnSxnUQ0Z8HnL2','DONANTE','2026-09-23 19:35:45.217');
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

-- Dump completed on 2026-09-23 14:38:04
