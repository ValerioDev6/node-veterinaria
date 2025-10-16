import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1760041967585 implements MigrationInterface {
    name = 'InitDatabase1760041967585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`objects\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`veterinarian_schedule_hours\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`hour_start\` time NOT NULL, \`hour_end\` time NOT NULL, \`hour\` varchar(2) NOT NULL, \`created_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`veterinarian_schedule_joins\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`veterinarian_schedule_day_id\` bigint NOT NULL, \`veterinarian_schedule_hour_id\` bigint NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`veterinarian_schedule_days\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`veterinarian_id\` varchar(255) NOT NULL, \`day\` varchar(20) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`username\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`email_verified_at\` tinyint NOT NULL DEFAULT 0, \`password\` varchar(255) NOT NULL, \`phone\` varchar(20) NULL, \`type_documento\` varchar(50) NULL, \`n_documento\` varchar(50) NULL, \`birthday\` date NOT NULL, \`avatar\` varchar(255) NULL, \`avatar_public_id\` varchar(255) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`roleId\` varchar(36) NULL, UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(250) NOT NULL, \`description\` text NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permissions\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`roleId\` varchar(36) NULL, \`permissionId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` varchar(36) NOT NULL, \`action\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`objectId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`owners\` (\`id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(100) NOT NULL, \`last_name\` varchar(100) NOT NULL, \`email\` varchar(100) NOT NULL, \`phone\` varchar(20) NOT NULL, \`address\` varchar(200) NOT NULL, \`city\` varchar(100) NOT NULL, \`type_documento\` varchar(100) NOT NULL, \`n_documento\` varchar(100) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pacientes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`species\` varchar(100) NOT NULL, \`breed\` varchar(100) NOT NULL, \`birth_date\` timestamp NOT NULL, \`gender\` varchar(50) NULL, \`color\` text NULL, \`weight\` float NULL, \`photo\` text NULL, \`photo_public_id\` varchar(255) NULL, \`medical_notes\` text NULL, \`owner_id\` int NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`medical_record\` (\`id\` int NOT NULL AUTO_INCREMENT, \`pet_id\` bigint NULL, \`veterinarian_id\` varchar(255) NOT NULL, \`event_type\` bigint NULL, \`appointment_id\` bigint NULL, \`vaccination_id\` bigint NULL, \`surgerie_id\` bigint NULL, \`event_date\` bigint NULL, \`notes\` text NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pagos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`monto\` decimal(10,2) NOT NULL, \`adelanto\` decimal(10,2) NOT NULL, \`metodo_pago\` varchar(50) NOT NULL, \`estado\` varchar(20) NOT NULL DEFAULT 'pendiente', \`cita_id\` int NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`citas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`day\` varchar(20) NOT NULL, \`day_appointment\` datetime NOT NULL, \`reason\` text NOT NULL, \`reprograming\` tinyint NOT NULL DEFAULT 0, \`state_payment\` varchar(20) NOT NULL DEFAULT 'pendiente', \`pet_id\` int NOT NULL, \`veterinarian_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`horario_citas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`appointment_id\` int NULL, \`veterinarie_schedule_hour_id\` bigint NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`veterinarian_schedule_joins\` ADD CONSTRAINT \`FK_a78a33c84e7b4cfdf211570c8bb\` FOREIGN KEY (\`veterinarian_schedule_day_id\`) REFERENCES \`veterinarian_schedule_days\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`veterinarian_schedule_joins\` ADD CONSTRAINT \`FK_f039ab9b8e29d95ca3530c5338e\` FOREIGN KEY (\`veterinarian_schedule_hour_id\`) REFERENCES \`veterinarian_schedule_hours\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`veterinarian_schedule_days\` ADD CONSTRAINT \`FK_25faf7617a7e7e935634cf5a2b2\` FOREIGN KEY (\`veterinarian_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_368e146b785b574f42ae9e53d5e\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_b4599f8b8f548d35850afa2d12c\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_06792d0c62ce6b0203c03643cdd\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD CONSTRAINT \`FK_b7d849add2a7a05c3155d85c84e\` FOREIGN KEY (\`objectId\`) REFERENCES \`objects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pacientes\` ADD CONSTRAINT \`FK_947997a36563a8420a2d58b2ca6\` FOREIGN KEY (\`owner_id\`) REFERENCES \`owners\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pagos\` ADD CONSTRAINT \`FK_d41b3734d5cc97bc01a29a3051f\` FOREIGN KEY (\`cita_id\`) REFERENCES \`citas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`citas\` ADD CONSTRAINT \`FK_2be3759d757220320e64d2c335f\` FOREIGN KEY (\`pet_id\`) REFERENCES \`pacientes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`citas\` ADD CONSTRAINT \`FK_532b1a14ece9ac451ecabb303e3\` FOREIGN KEY (\`veterinarian_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`citas\` ADD CONSTRAINT \`FK_26d9e89b7dad9340bfc5596e41d\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`horario_citas\` ADD CONSTRAINT \`FK_f20380989d045d363456563ee4d\` FOREIGN KEY (\`appointment_id\`) REFERENCES \`citas\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`horario_citas\` DROP FOREIGN KEY \`FK_f20380989d045d363456563ee4d\``);
        await queryRunner.query(`ALTER TABLE \`citas\` DROP FOREIGN KEY \`FK_26d9e89b7dad9340bfc5596e41d\``);
        await queryRunner.query(`ALTER TABLE \`citas\` DROP FOREIGN KEY \`FK_532b1a14ece9ac451ecabb303e3\``);
        await queryRunner.query(`ALTER TABLE \`citas\` DROP FOREIGN KEY \`FK_2be3759d757220320e64d2c335f\``);
        await queryRunner.query(`ALTER TABLE \`pagos\` DROP FOREIGN KEY \`FK_d41b3734d5cc97bc01a29a3051f\``);
        await queryRunner.query(`ALTER TABLE \`pacientes\` DROP FOREIGN KEY \`FK_947997a36563a8420a2d58b2ca6\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP FOREIGN KEY \`FK_b7d849add2a7a05c3155d85c84e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_06792d0c62ce6b0203c03643cdd\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_b4599f8b8f548d35850afa2d12c\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_368e146b785b574f42ae9e53d5e\``);
        await queryRunner.query(`ALTER TABLE \`veterinarian_schedule_days\` DROP FOREIGN KEY \`FK_25faf7617a7e7e935634cf5a2b2\``);
        await queryRunner.query(`ALTER TABLE \`veterinarian_schedule_joins\` DROP FOREIGN KEY \`FK_f039ab9b8e29d95ca3530c5338e\``);
        await queryRunner.query(`ALTER TABLE \`veterinarian_schedule_joins\` DROP FOREIGN KEY \`FK_a78a33c84e7b4cfdf211570c8bb\``);
        await queryRunner.query(`DROP TABLE \`horario_citas\``);
        await queryRunner.query(`DROP TABLE \`citas\``);
        await queryRunner.query(`DROP TABLE \`pagos\``);
        await queryRunner.query(`DROP TABLE \`medical_record\``);
        await queryRunner.query(`DROP TABLE \`pacientes\``);
        await queryRunner.query(`DROP TABLE \`owners\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`veterinarian_schedule_days\``);
        await queryRunner.query(`DROP TABLE \`veterinarian_schedule_joins\``);
        await queryRunner.query(`DROP TABLE \`veterinarian_schedule_hours\``);
        await queryRunner.query(`DROP TABLE \`objects\``);
    }

}
