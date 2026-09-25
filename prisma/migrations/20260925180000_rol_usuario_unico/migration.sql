-- Los perfiles donante/voluntario/beneficiario dejan de ser roles de cuenta: todos pasan a USUARIO.
ALTER TABLE `Usuario` MODIFY `rol` ENUM('DONANTE', 'VOLUNTARIO', 'BENEFICIARIO', 'ADMIN', 'USUARIO') NOT NULL;
UPDATE `Usuario` SET `rol` = 'USUARIO' WHERE `rol` <> 'ADMIN';
ALTER TABLE `Usuario` MODIFY `rol` ENUM('USUARIO', 'ADMIN') NOT NULL;
