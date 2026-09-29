-- Datos de contacto opcionales del usuario (se piden al inscribirse como voluntario).
ALTER TABLE `Usuario`
  ADD COLUMN `telefono` VARCHAR(191) NULL,
  ADD COLUMN `tipoDocumento` ENUM('CC', 'TI', 'CE', 'PPT', 'RC', 'OTRO') NULL,
  ADD COLUMN `numeroDocumento` VARCHAR(191) NULL,
  ADD COLUMN `ciudad` VARCHAR(191) NULL;
