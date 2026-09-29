-- Registro afectado por cada cambio (usuario, programa, campaña, actividad…).
ALTER TABLE `LogCambio`
  ADD COLUMN `afectadoTipo` VARCHAR(40) NULL,
  ADD COLUMN `afectadoNombre` VARCHAR(255) NULL;
