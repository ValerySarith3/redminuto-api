-- Datos de pago para transferencia, llave Bre-B y efectivo (editables desde el panel).
CREATE TABLE `DatosPago` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `banco` VARCHAR(100) NOT NULL,
    `tipoCuenta` VARCHAR(40) NOT NULL,
    `numeroCuenta` VARCHAR(40) NOT NULL,
    `titular` VARCHAR(150) NOT NULL,
    `nit` VARCHAR(30) NOT NULL,
    `llave` VARCHAR(100) NOT NULL,
    `direccionEfectivo` VARCHAR(255) NOT NULL,
    `horarioEfectivo` VARCHAR(150) NOT NULL,
    `actualizadoEn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `DatosPago` (`id`, `banco`, `tipoCuenta`, `numeroCuenta`, `titular`, `nit`, `llave`, `direccionEfectivo`, `horarioEfectivo`, `actualizadoEn`)
VALUES (1, 'Bancolombia', 'Cuenta de ahorros', '236-418593-27', 'Fundación Casa Minuto de Dios', '900.482.316-5', '@casaminutodedios', 'Carrera 73 # 80-65, Bogotá', 'Lunes a viernes de 8:00 a. m. a 5:00 p. m.', CURRENT_TIMESTAMP(3));
