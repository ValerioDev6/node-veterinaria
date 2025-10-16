import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeVacunaPaymentEntity1760208125924 implements MigrationInterface {
    name = 'ChangeVacunaPaymentEntity1760208125924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_368e146b785b574f42ae9e53d5e\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`phone\` \`phone\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`type_documento\` \`type_documento\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`n_documento\` \`n_documento\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`avatar_public_id\` \`avatar_public_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`roleId\` \`roleId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_b4599f8b8f548d35850afa2d12c\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_06792d0c62ce6b0203c03643cdd\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` CHANGE \`roleId\` \`roleId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` CHANGE \`permissionId\` \`permissionId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP FOREIGN KEY \`FK_b7d849add2a7a05c3155d85c84e\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`objectId\` \`objectId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`gender\` \`gender\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`color\` \`color\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`weight\` \`weight\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`photo\` \`photo\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`photo_public_id\` \`photo_public_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`medical_notes\` \`medical_notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`vacunas_pagos\` DROP FOREIGN KEY \`FK_7f90bdbea9c32f4e43a51e18b58\``);
        await queryRunner.query(`ALTER TABLE \`vacunas_pagos\` CHANGE \`vacuna_id\` \`vacuna_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`vacunas\` CHANGE \`vaccine_names\` \`vaccine_names\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` DROP FOREIGN KEY \`FK_3155948c2a14735de45a198e94b\``);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` DROP FOREIGN KEY \`FK_30788fea383eb410438400e8cfe\``);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` CHANGE \`hour\` \`hour\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` CHANGE \`vaccination_id\` \`vaccination_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` CHANGE \`veterinarie_schedule_hour_id\` \`veterinarie_schedule_hour_id\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` DROP FOREIGN KEY \`FK_f20380989d045d363456563ee4d\``);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` DROP FOREIGN KEY \`FK_e54c821b5df63d14dd482d5e12b\``);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` CHANGE \`appointment_id\` \`appointment_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` CHANGE \`veterinarie_schedule_hour_id\` \`veterinarie_schedule_hour_id\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` DROP FOREIGN KEY \`FK_ccb96f635a6644f79d07b2d8b2e\``);
        await queryRunner.query(`ALTER TABLE \`medical_record\` DROP FOREIGN KEY \`FK_1cce5a380b9795c2b18bfc16c74\``);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`pet_id\` \`pet_id\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`event_type\` \`event_type\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`appointment_id\` \`appointment_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`vaccination_id\` \`vaccination_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`surgerie_id\` \`surgerie_id\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`event_date\` \`event_date\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`notes\` \`notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_368e146b785b574f42ae9e53d5e\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_b4599f8b8f548d35850afa2d12c\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_06792d0c62ce6b0203c03643cdd\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD CONSTRAINT \`FK_b7d849add2a7a05c3155d85c84e\` FOREIGN KEY (\`objectId\`) REFERENCES \`objects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vacunas_pagos\` ADD CONSTRAINT \`FK_7f90bdbea9c32f4e43a51e18b58\` FOREIGN KEY (\`vacuna_id\`) REFERENCES \`vacunas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` ADD CONSTRAINT \`FK_3155948c2a14735de45a198e94b\` FOREIGN KEY (\`vaccination_id\`) REFERENCES \`vacunas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` ADD CONSTRAINT \`FK_30788fea383eb410438400e8cfe\` FOREIGN KEY (\`veterinarie_schedule_hour_id\`) REFERENCES \`veterinarian_schedule_hours\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` ADD CONSTRAINT \`FK_f20380989d045d363456563ee4d\` FOREIGN KEY (\`appointment_id\`) REFERENCES \`citas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` ADD CONSTRAINT \`FK_e54c821b5df63d14dd482d5e12b\` FOREIGN KEY (\`veterinarie_schedule_hour_id\`) REFERENCES \`veterinarian_schedule_hours\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` ADD CONSTRAINT \`FK_ccb96f635a6644f79d07b2d8b2e\` FOREIGN KEY (\`appointment_id\`) REFERENCES \`citas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` ADD CONSTRAINT \`FK_1cce5a380b9795c2b18bfc16c74\` FOREIGN KEY (\`vaccination_id\`) REFERENCES \`vacunas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`medical_record\` DROP FOREIGN KEY \`FK_1cce5a380b9795c2b18bfc16c74\``);
        await queryRunner.query(`ALTER TABLE \`medical_record\` DROP FOREIGN KEY \`FK_ccb96f635a6644f79d07b2d8b2e\``);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` DROP FOREIGN KEY \`FK_e54c821b5df63d14dd482d5e12b\``);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` DROP FOREIGN KEY \`FK_f20380989d045d363456563ee4d\``);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` DROP FOREIGN KEY \`FK_30788fea383eb410438400e8cfe\``);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` DROP FOREIGN KEY \`FK_3155948c2a14735de45a198e94b\``);
        await queryRunner.query(`ALTER TABLE \`vacunas_pagos\` DROP FOREIGN KEY \`FK_7f90bdbea9c32f4e43a51e18b58\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP FOREIGN KEY \`FK_b7d849add2a7a05c3155d85c84e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_06792d0c62ce6b0203c03643cdd\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_b4599f8b8f548d35850afa2d12c\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_368e146b785b574f42ae9e53d5e\``);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`notes\` \`notes\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`event_date\` \`event_date\` bigint NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`surgerie_id\` \`surgerie_id\` bigint NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`vaccination_id\` \`vaccination_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`appointment_id\` \`appointment_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`event_type\` \`event_type\` bigint NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` CHANGE \`pet_id\` \`pet_id\` bigint NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` ADD CONSTRAINT \`FK_1cce5a380b9795c2b18bfc16c74\` FOREIGN KEY (\`vaccination_id\`) REFERENCES \`vacunas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`medical_record\` ADD CONSTRAINT \`FK_ccb96f635a6644f79d07b2d8b2e\` FOREIGN KEY (\`appointment_id\`) REFERENCES \`citas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` CHANGE \`veterinarie_schedule_hour_id\` \`veterinarie_schedule_hour_id\` bigint NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` CHANGE \`appointment_id\` \`appointment_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` ADD CONSTRAINT \`FK_e54c821b5df63d14dd482d5e12b\` FOREIGN KEY (\`veterinarie_schedule_hour_id\`) REFERENCES \`veterinarian_schedule_hours\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` ADD CONSTRAINT \`FK_f20380989d045d363456563ee4d\` FOREIGN KEY (\`appointment_id\`) REFERENCES \`citas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` CHANGE \`veterinarie_schedule_hour_id\` \`veterinarie_schedule_hour_id\` bigint NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` CHANGE \`vaccination_id\` \`vaccination_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` CHANGE \`hour\` \`hour\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` ADD CONSTRAINT \`FK_30788fea383eb410438400e8cfe\` FOREIGN KEY (\`veterinarie_schedule_hour_id\`) REFERENCES \`veterinarian_schedule_hours\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vacunas_horarios\` ADD CONSTRAINT \`FK_3155948c2a14735de45a198e94b\` FOREIGN KEY (\`vaccination_id\`) REFERENCES \`vacunas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vacunas\` CHANGE \`vaccine_names\` \`vaccine_names\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`vacunas_pagos\` CHANGE \`vacuna_id\` \`vacuna_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`vacunas_pagos\` ADD CONSTRAINT \`FK_7f90bdbea9c32f4e43a51e18b58\` FOREIGN KEY (\`vacuna_id\`) REFERENCES \`vacunas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`medical_notes\` \`medical_notes\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`photo_public_id\` \`photo_public_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`photo\` \`photo\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`weight\` \`weight\` float(12) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`color\` \`color\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` CHANGE \`gender\` \`gender\` varchar(50) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`permissions\` CHANGE \`objectId\` \`objectId\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD CONSTRAINT \`FK_b7d849add2a7a05c3155d85c84e\` FOREIGN KEY (\`objectId\`) REFERENCES \`objects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` CHANGE \`permissionId\` \`permissionId\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` CHANGE \`roleId\` \`roleId\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_06792d0c62ce6b0203c03643cdd\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_b4599f8b8f548d35850afa2d12c\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`roleId\` \`roleId\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`avatar_public_id\` \`avatar_public_id\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`n_documento\` \`n_documento\` varchar(50) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`type_documento\` \`type_documento\` varchar(50) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`phone\` \`phone\` varchar(20) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_368e146b785b574f42ae9e53d5e\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
