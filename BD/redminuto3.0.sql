-- MySQL dump 10.13  Distrib 8.4.9, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: redminuto
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `redminuto`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `redminuto` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `redminuto`;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('61ea6004-76aa-4871-a7d5-430378e25020','146264ecc755d5fa41771cf0f3a80d95189f7cb0b6e67bf09c16a10ae214b39d','2026-09-30 00:33:39.154','20260929200000_datos_pago',NULL,NULL,'2026-09-30 00:33:39.103',1),('6665e9f5-2529-4dde-83a2-5922641dab77','bdfd62f72da9083945c70bed49681d341109f84aaa365d9f1ecce3711df4bf07','2026-09-29 18:37:41.398','20260929180000_renombrar_log_cambios',NULL,NULL,'2026-09-29 18:37:41.089',1),('6e163219-41e1-4a40-a367-6af1c06e39b7','de8485a0eb44ebf6fbf8ba37481a866660272e9626806db468bd77abbcaa20c8','2026-09-25 13:05:28.225','20260923173957_add_tipo_apoyo',NULL,NULL,'2026-09-25 13:05:28.214',1),('77334ece-bfc6-4d3c-b592-abf3379262b7','5fda9ede7edbfee4c69173ef9543e4cdc6af9854147a725b7a9dd1574a17a5bd','2026-09-29 19:08:50.332','20260929190000_log_cambios_afectado',NULL,NULL,'2026-09-29 19:08:50.250',1),('829464bb-04b7-43fa-816d-5d26302d687b','11cc1e7e745934d874e59dc09bc70c1e56da931d03ec130cd4baedc0ca7f8e9c','2026-09-30 01:05:21.548','20260930090000_listas_maestras_y_orden_columnas',NULL,NULL,'2026-09-30 01:05:20.258',1),('899d2a79-8e44-4699-be45-38cff2b95286','9791addc0c44b18e5e1aef67cc93ca2c3f0740f5a71e539ce2f9567f1a5b1569','2026-09-13 00:08:27.536','20260913000827_init',NULL,NULL,'2026-09-13 00:08:27.219',1),('8e7a1074-27ad-4f4c-a824-53774d47da60','9062c0a22f77e5ed2485f67e714f5a3579a4296d2a1bf14a455cf6d3716f3e7c','2026-09-25 13:05:28.237','20260923183344_add_datos_solicitud_beneficiario',NULL,NULL,'2026-09-25 13:05:28.226',1),('b011f0f9-4dfa-4685-ad07-0be747ec0c7a','ed92cc404a945b9678b0d9fd2d3ebf4964ea5e13737398942e5f8871b1064cff','2026-09-25 13:43:23.787','20260925180000_rol_usuario_unico',NULL,NULL,'2026-09-25 13:43:23.715',1),('befc145d-ba48-43fb-8a96-e7a60a66d57f','6b1378449c63708a94a4611a50cdfde94343e12dd128d92f79e9635ea89ac0e5','2026-09-30 00:46:01.538','20260929210000_novedades_campana',NULL,NULL,'2026-09-30 00:46:01.398',1),('c24ff865-23ff-42aa-85c5-80555546b093','2d6f55f898f50d5d9fa178facf275b5c02313857886905badbf2243bf4e2812c','2026-09-29 16:07:41.389','20260929120000_datos_contacto_usuario',NULL,NULL,'2026-09-29 16:07:41.296',1),('cd78c008-7d81-4d26-98f7-d95bb74212c2','de2fc6a5935503aed176a7763875d6e829a1e1d8eaa0a0368bea11b125713898','2026-09-29 18:30:15.503','20260929170000_auditoria_datos',NULL,NULL,'2026-09-29 18:30:15.434',1),('d4afe603-bfc9-4eb2-bb49-58aad6d254f3','4fd23e5cc262d4591e76dbfed7af4d74dc1ab31e4f4e0ed1a011a2d188367776','2026-09-25 13:05:28.336','20260923191234_cascade_borrado_usuario',NULL,NULL,'2026-09-25 13:05:28.239',1),('e715dbc3-e60c-4084-9827-2981a0637f81','c9675e891dee1ec60549995521a6d76ae5ee487dac7280298361c34272b59a38','2026-09-30 01:15:35.236','20260930120000_log_solo_cambios',NULL,NULL,'2026-09-30 01:15:35.182',1),('ea76631a-653c-4a50-9d8b-10310d765615','b4a36cb55e40978041cb9521ee902f94cb52b4e50495dc17740e802a80fd84cc','2026-09-29 16:25:16.813','20260929150000_auditoria',NULL,NULL,'2026-09-29 16:25:16.610',1),('fa686a3d-e16d-4af3-ba89-bda9c8c66750','041312646b7d994fd76797ff03576ab023eb64e9930f00cf90ed29fd8057b27a','2026-09-25 13:06:49.117','20260925130000_trazabilidad_actividades_pagos_consentimiento',NULL,NULL,'2026-09-25 13:06:48.757',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actividad`
--

DROP TABLE IF EXISTS `actividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `programaId` int NOT NULL,
  `titulo` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `horaInicio` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `horaFin` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lugar` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cupo` int NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Actividad_programaId_fkey` (`programaId`),
  CONSTRAINT `Actividad_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividad`
--

LOCK TABLES `actividad` WRITE;
/*!40000 ALTER TABLE `actividad` DISABLE KEYS */;
INSERT INTO `actividad` VALUES (2,3,'Prueba','prueba de actividad ','2026-09-30','08:00','12:00','Casa Minuto de Dios',10,'2026-09-29 19:32:20.781');
/*!40000 ALTER TABLE `actividad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campana`
--

DROP TABLE IF EXISTS `campana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campana` (
  `id` int NOT NULL AUTO_INCREMENT,
  `programaId` int NOT NULL,
  `titulo` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `metaMonto` decimal(12,2) NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
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
INSERT INTO `campana` VALUES (1,3,'Mercados de fin de año','Mercados navideños para 100 familias.',8000000.00,'2026-09-13 00:26:06.284'),(2,4,'Útiles escolares 2027','Kits escolares para niños del programa.',5000000.00,'2026-09-13 00:26:06.489');
/*!40000 ALTER TABLE `campana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consentimientodatos`
--

DROP TABLE IF EXISTS `consentimientodatos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consentimientodatos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuarioId` int NOT NULL,
  `finalidad` enum('REGISTRO','SOLICITUD_AYUDA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `versionPolitica` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aceptadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ConsentimientoDatos_usuarioId_fkey` (`usuarioId`),
  CONSTRAINT `ConsentimientoDatos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consentimientodatos`
--

LOCK TABLES `consentimientodatos` WRITE;
/*!40000 ALTER TABLE `consentimientodatos` DISABLE KEYS */;
INSERT INTO `consentimientodatos` VALUES (3,7,'REGISTRO','2026-09','2026-09-29 19:11:00.468');
/*!40000 ALTER TABLE `consentimientodatos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `datospago`
--

DROP TABLE IF EXISTS `datospago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `datospago` (
  `id` int NOT NULL DEFAULT '1',
  `banco` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipoCuenta` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numeroCuenta` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titular` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `llave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccionEfectivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `horarioEfectivo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actualizadoEn` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `datospago`
--

LOCK TABLES `datospago` WRITE;
/*!40000 ALTER TABLE `datospago` DISABLE KEYS */;
INSERT INTO `datospago` VALUES (1,'Bancolombia','Cuenta de ahorros','236-418593-27','Fundación Casa Minuto de Dios','900.482.316-5','@casaminutodedios','Carrera 73 # 80-65, Bogotá','Lunes a viernes de 8:00 a. m. a 5:00 p. m.','2026-09-29 19:33:39.142');
/*!40000 ALTER TABLE `datospago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donacion`
--

DROP TABLE IF EXISTS `donacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campanaId` int NOT NULL,
  `donanteId` int DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `canal` enum('PASARELA','TRANSFERENCIA','EFECTIVO','LLAVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('PENDIENTE','COMPLETADA','FALLIDA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Donacion_campanaId_fkey` (`campanaId`),
  KEY `Donacion_donanteId_fkey` (`donanteId`),
  CONSTRAINT `Donacion_campanaId_fkey` FOREIGN KEY (`campanaId`) REFERENCES `campana` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Donacion_donanteId_fkey` FOREIGN KEY (`donanteId`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donacion`
--

LOCK TABLES `donacion` WRITE;
/*!40000 ALTER TABLE `donacion` DISABLE KEYS */;
INSERT INTO `donacion` VALUES (1,1,3,50000.00,'PASARELA','COMPLETADA','2026-09-13 00:28:27.045'),(4,1,7,205000.00,'PASARELA','COMPLETADA','2026-09-29 19:14:54.791');
/*!40000 ALTER TABLE `donacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historialestado`
--

DROP TABLE IF EXISTS `historialestado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historialestado` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuarioId` int DEFAULT NULL,
  `entidad` enum('DONACION','INSCRIPCION','SOLICITUD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entidadId` int NOT NULL,
  `estadoAnterior` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estadoNuevo` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nota` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `HistorialEstado_entidad_entidadId_idx` (`entidad`,`entidadId`),
  KEY `HistorialEstado_usuarioId_fkey` (`usuarioId`),
  CONSTRAINT `HistorialEstado_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historialestado`
--

LOCK TABLES `historialestado` WRITE;
/*!40000 ALTER TABLE `historialestado` DISABLE KEYS */;
INSERT INTO `historialestado` VALUES (1,3,'DONACION',1,NULL,'COMPLETADA','Registro previo a la bitácora','2026-09-13 00:28:27.045'),(2,3,'INSCRIPCION',1,NULL,'PENDIENTE','Registro previo a la bitácora','2026-09-13 00:28:53.806'),(6,2,'INSCRIPCION',1,'PENDIENTE','RECHAZADA',NULL,'2026-09-29 16:30:09.982'),(9,7,'DONACION',4,NULL,'PENDIENTE','Pago iniciado en PayU','2026-09-29 19:14:54.808'),(10,NULL,'DONACION',4,'PENDIENTE','COMPLETADA','PayU: APPROVED (VISA) · Aprobada','2026-09-29 19:21:04.469'),(11,7,'INSCRIPCION',3,NULL,'PENDIENTE','Inscripción recibida','2026-09-29 19:42:05.005'),(12,2,'INSCRIPCION',3,'PENDIENTE','ACEPTADA',NULL,'2026-09-30 00:50:06.560');
/*!40000 ALTER TABLE `historialestado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inscripcionvoluntario`
--

DROP TABLE IF EXISTS `inscripcionvoluntario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inscripcionvoluntario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `voluntarioId` int NOT NULL,
  `programaId` int NOT NULL,
  `actividadId` int DEFAULT NULL,
  `estado` enum('PENDIENTE','ACEPTADA','RECHAZADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `InscripcionVoluntario_voluntarioId_actividadId_key` (`voluntarioId`,`actividadId`),
  KEY `InscripcionVoluntario_programaId_fkey` (`programaId`),
  KEY `InscripcionVoluntario_actividadId_fkey` (`actividadId`),
  CONSTRAINT `InscripcionVoluntario_actividadId_fkey` FOREIGN KEY (`actividadId`) REFERENCES `actividad` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InscripcionVoluntario_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `InscripcionVoluntario_voluntarioId_fkey` FOREIGN KEY (`voluntarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripcionvoluntario`
--

LOCK TABLES `inscripcionvoluntario` WRITE;
/*!40000 ALTER TABLE `inscripcionvoluntario` DISABLE KEYS */;
INSERT INTO `inscripcionvoluntario` VALUES (1,3,3,NULL,'RECHAZADA','2026-09-13 00:28:53.806'),(3,7,3,2,'ACEPTADA','2026-09-29 19:42:04.996');
/*!40000 ALTER TABLE `inscripcionvoluntario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listamaestra`
--

DROP TABLE IF EXISTS `listamaestra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listamaestra` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ListaMaestra_codigo_key` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listamaestra`
--

LOCK TABLES `listamaestra` WRITE;
/*!40000 ALTER TABLE `listamaestra` DISABLE KEYS */;
INSERT INTO `listamaestra` VALUES (1,'TIPO_DOCUMENTO','Tipos de documento','Documentos de identidad aceptados para usuarios y solicitudes de ayuda','2026-09-29 20:05:20.376');
/*!40000 ALTER TABLE `listamaestra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logcambio`
--

DROP TABLE IF EXISTS `logcambio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logcambio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuarioId` int DEFAULT NULL,
  `modulo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `afectadoTipo` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `afectadoNombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `datosAnteriores` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `datosNuevos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `LogCambio_creadoEn_idx` (`creadoEn`),
  KEY `LogCambio_modulo_idx` (`modulo`),
  KEY `LogCambio_usuarioId_fkey` (`usuarioId`),
  CONSTRAINT `LogCambio_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logcambio`
--

LOCK TABLES `logcambio` WRITE;
/*!40000 ALTER TABLE `logcambio` DISABLE KEYS */;
INSERT INTO `logcambio` VALUES (12,2,'ACTIVIDADES','CREAR','Creó la actividad «Prueba»','Actividad','Prueba',NULL,'{\"Título\":\"Prueba\",\"Descripción\":\"prueba de actividad \",\"Fecha\":\"2026-09-30\",\"Hora de inicio\":\"08:00\",\"Hora de fin\":\"12:00\",\"Lugar\":\"Casa Minuto de Dios\",\"Cupo\":\"10\",\"Programa\":\"Comedores comunitarios\"}','::1','2026-09-29 19:32:20.795'),(13,7,'CUENTAS','ACTUALIZAR_DATOS','Actualizó sus datos de contacto','Usuario','Luisa Fernanda Martinez Rosero (lmartinez9a@gmail.com)','{\"Celular\":\"—\",\"Tipo de documento\":\"—\",\"Número de documento\":\"—\",\"Ciudad\":\"—\"}','{\"Celular\":\"3118482726\",\"Tipo de documento\":\"CC\",\"Número de documento\":\"124355444\",\"Ciudad\":\"BOGOTA\"}','::1','2026-09-29 19:42:04.962');
/*!40000 ALTER TABLE `logcambio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `novedadcampana`
--

DROP TABLE IF EXISTS `novedadcampana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `novedadcampana` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campanaId` int NOT NULL,
  `titulo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenido` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `NovedadCampana_campanaId_creadoEn_idx` (`campanaId`,`creadoEn`),
  CONSTRAINT `NovedadCampana_campanaId_fkey` FOREIGN KEY (`campanaId`) REFERENCES `campana` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `novedadcampana`
--

LOCK TABLES `novedadcampana` WRITE;
/*!40000 ALTER TABLE `novedadcampana` DISABLE KEYS */;
/*!40000 ALTER TABLE `novedadcampana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opcionlistamaestra`
--

DROP TABLE IF EXISTS `opcionlistamaestra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opcionlistamaestra` (
  `id` int NOT NULL AUTO_INCREMENT,
  `listaMaestraId` int NOT NULL,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orden` int NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `OpcionListaMaestra_listaMaestraId_codigo_key` (`listaMaestraId`,`codigo`),
  CONSTRAINT `OpcionListaMaestra_listaMaestraId_fkey` FOREIGN KEY (`listaMaestraId`) REFERENCES `listamaestra` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opcionlistamaestra`
--

LOCK TABLES `opcionlistamaestra` WRITE;
/*!40000 ALTER TABLE `opcionlistamaestra` DISABLE KEYS */;
INSERT INTO `opcionlistamaestra` VALUES (1,1,'CC','Cédula de ciudadanía',1,1,'2026-09-29 20:05:20.380'),(2,1,'TI','Tarjeta de identidad',2,1,'2026-09-29 20:05:20.380'),(3,1,'CE','Cédula de extranjería',3,1,'2026-09-29 20:05:20.380'),(4,1,'PPT','Permiso por Protección Temporal',4,1,'2026-09-29 20:05:20.380'),(5,1,'RC','Registro civil',5,1,'2026-09-29 20:05:20.380'),(6,1,'OTRO','Otro',6,1,'2026-09-29 20:05:20.380');
/*!40000 ALTER TABLE `opcionlistamaestra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id` int NOT NULL AUTO_INCREMENT,
  `donacionId` int NOT NULL,
  `referencia` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `metodo` enum('PASARELA','TRANSFERENCIA','EFECTIVO','LLAVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('PENDIENTE','APROBADO','RECHAZADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `respuestaPasarela` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Pago_referencia_key` (`referencia`),
  UNIQUE KEY `Pago_donacionId_key` (`donacionId`),
  CONSTRAINT `Pago_donacionId_fkey` FOREIGN KEY (`donacionId`) REFERENCES `donacion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES (1,1,'LEGADO-1','PASARELA','APROBADO',NULL,'2026-09-13 00:28:27.045'),(4,4,'RM-1790709294787-e246352c','PASARELA','APROBADO','{\"merchantId\":\"508029\",\"merchant_name\":\"Test PayU\",\"merchant_address\":\"Av 123 Calle 12\",\"telephone\":\"7512354\",\"merchant_url\":\"http://pruebaslapv.xtrweb.com\",\"transactionState\":\"4\",\"lapTransactionState\":\"APPROVED\",\"message\":\"APPROVED\",\"referenceCode\":\"RM-1790709294787-e246352c\",\"reference_pol\":\"2158154888\",\"transactionId\":\"1ec6298f-d1ca-4cf0-ae2f-5aaeb14d2700\",\"description\":\"Donación a Mercados de fin de año\",\"trazabilityCode\":\"202918960346\",\"cus\":\"202918960346\",\"orderLanguage\":\"es\",\"extra1\":\"\",\"extra2\":\"\",\"extra3\":\"\",\"polTransactionState\":\"4\",\"signature\":\"140fa54752ad569d5d02e97a34e9df62\",\"polResponseCode\":\"1\",\"lapResponseCode\":\"APPROVED\",\"risk\":\"\",\"polPaymentMethod\":\"1071\",\"lapPaymentMethod\":\"VISA\",\"polPaymentMethodType\":\"2\",\"lapPaymentMethodType\":\"CREDIT_CARD\",\"installmentsNumber\":\"1\",\"TX_VALUE\":\"205000.00\",\"TX_TAX\":\".00\",\"currency\":\"COP\",\"lng\":\"es\",\"pseCycle\":\"\",\"buyerEmail\":\"lmartinez9a@gmail.com\",\"pseBank\":\"\",\"pseReference1\":\"\",\"pseReference2\":\"\",\"pseReference3\":\"\",\"authorizationCode\":[\"654321\",\"654321\"],\"khipuBank\":\"\",\"TX_ADMINISTRATIVE_FEE\":\".00\",\"TX_TAX_ADMINISTRATIVE_FEE\":\".00\",\"TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE\":\".00\",\"processingDate\":\"2026-09-29\"}','2026-09-29 19:14:54.804');
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programa`
--

DROP TABLE IF EXISTS `programa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `metaCupoVoluntarios` int NOT NULL DEFAULT '0',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudbeneficiario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `beneficiarioId` int NOT NULL,
  `programaId` int NOT NULL,
  `tipoApoyo` enum('ALIMENTOS','SALUD','EDUCACION','VIVIENDA','EMPLEO','OTRO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTRO',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombreCompleto` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipoDocumentoId` int NOT NULL,
  `numeroDocumento` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ciudad` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `personasACargo` int NOT NULL DEFAULT '1',
  `aceptaTratamientoDatos` tinyint(1) NOT NULL DEFAULT '0',
  `estado` enum('PENDIENTE','EN_REVISION','APROBADA','RECHAZADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `SolicitudBeneficiario_programaId_fkey` (`programaId`),
  KEY `SolicitudBeneficiario_beneficiarioId_fkey` (`beneficiarioId`),
  KEY `SolicitudBeneficiario_tipoDocumentoId_fkey` (`tipoDocumentoId`),
  CONSTRAINT `SolicitudBeneficiario_beneficiarioId_fkey` FOREIGN KEY (`beneficiarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SolicitudBeneficiario_programaId_fkey` FOREIGN KEY (`programaId`) REFERENCES `programa` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `SolicitudBeneficiario_tipoDocumentoId_fkey` FOREIGN KEY (`tipoDocumentoId`) REFERENCES `opcionlistamaestra` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rol` enum('USUARIO','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoDocumentoId` int DEFAULT NULL,
  `numeroDocumento` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Usuario_email_key` (`email`),
  KEY `Usuario_tipoDocumentoId_fkey` (`tipoDocumentoId`),
  CONSTRAINT `Usuario_tipoDocumentoId_fkey` FOREIGN KEY (`tipoDocumentoId`) REFERENCES `opcionlistamaestra` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'USUARIO','Ana Prueba',NULL,NULL,NULL,NULL,'ana.prueba@example.com','$2b$10$OrQzfr3bwO7Bx5YMA3rd1.n0e0Gx4.jfs0dj2uMAsv.rbeIikLuFy','2026-09-13 00:22:17.706'),(2,'ADMIN','Admin RedMinuto',NULL,NULL,NULL,NULL,'admin@redminuto.test','$2b$10$bWUe6gDpZa.dhgOCchaUtuRfEMr.wbErhksM8puzu76eAXyEz5Z8m','2026-09-13 00:25:53.931'),(3,'USUARIO','Valeria Rios',NULL,NULL,NULL,NULL,'valeria.rios@example.com','$2b$10$uedsqvzOeeC4UKPglk2soeL6KgEsHa8jCaZo7mZQyxmZOyCrv5DLu','2026-09-13 00:27:47.051'),(7,'USUARIO','Luisa Fernanda Martinez Rosero','3118482726',1,'124355444','BOGOTA','lmartinez9a@gmail.com','$2b$10$v888nwAlgxmX2QXg9xGx/eD/oW.zfz5uQ3UfppusULW0mUq05XdP6','2026-09-29 19:11:00.468');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'redminuto'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-29 20:16:32
