-- Información anterior y nueva de cada cambio registrado en el log.
ALTER TABLE `Auditoria`
  ADD COLUMN `datosAnteriores` TEXT NULL,
  ADD COLUMN `datosNuevos` TEXT NULL;
