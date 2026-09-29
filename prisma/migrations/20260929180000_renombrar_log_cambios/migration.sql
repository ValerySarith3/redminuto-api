-- La tabla "Auditoria" pasa a llamarse "LogCambio" conservando sus registros.
ALTER TABLE `Auditoria` DROP FOREIGN KEY `Auditoria_usuarioId_fkey`;
RENAME TABLE `Auditoria` TO `LogCambio`;
ALTER TABLE `LogCambio`
  RENAME INDEX `Auditoria_creadoEn_idx` TO `LogCambio_creadoEn_idx`,
  RENAME INDEX `Auditoria_modulo_idx` TO `LogCambio_modulo_idx`,
  RENAME INDEX `Auditoria_usuarioId_fkey` TO `LogCambio_usuarioId_fkey`;
ALTER TABLE `LogCambio` ADD CONSTRAINT `LogCambio_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
