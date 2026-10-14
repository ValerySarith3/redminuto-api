-- El log es de cambios, no de auditoría: se quitan los movimientos (inicios de sesión y registros de cuenta)
-- y la columna `exitoso`, que solo servía para marcar inicios de sesión fallidos.
DELETE FROM `LogCambio` WHERE `accion` IN ('INICIO_SESION', 'REGISTRO');
ALTER TABLE `LogCambio` DROP COLUMN `exitoso`;
