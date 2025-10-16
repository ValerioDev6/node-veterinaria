import { AppDataSource } from '@config/data-source'
import { Logger } from '@shared/logger/logger'
import { RoleSeeder } from './role.seeder'
import { UserSeeder } from './user.seeder'
import { VeterinarianScheduleHoursSeeder } from './veterinarie_schedule_hours.seeder'

export class DatabaseSeeder {
  private logger = new Logger('DatabaseSeeder')
  private seeders = [RoleSeeder, UserSeeder, VeterinarianScheduleHoursSeeder]

  async run(seederClass?: string): Promise<void> {
    try {
      // Inicializar conexión
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
        this.logger.success('Database connected')
        this.logger.log('')
      }

      this.logger.log('Starting database seeding...')
      this.logger.log('')
      this.logger.log('==========================================')
      this.logger.log('')

      if (seederClass) {
        // Ejecutar un seeder específico
        const Seeder = this.seeders.find(
          (s) => s.name.toLowerCase() === seederClass.toLowerCase()
        )

        if (!Seeder) {
          throw new Error(`Seeder ${seederClass} not found`)
        }

        this.logger.info(`Running seeder: ${Seeder.name}`)
        const seeder = new Seeder()
        await seeder['execute']()
      } else {
        // Ejecutar todos los seeders
        this.logger.info(`Running ${this.seeders.length} seeders...`)
        this.logger.log('')

        for (const SeederClass of this.seeders) {
          const seeder = new SeederClass()
          await seeder['execute']()
          this.logger.log('')
        }
      }

      this.logger.log('==========================================')
      this.logger.log('')
      this.logger.success('Database seeding completed!')
      this.logger.log('')

      await AppDataSource.destroy()
      process.exit(0)
    } catch (error) {
      this.logger.log('')
      this.logger.error(`Seeding failed: ${error}`)
      await AppDataSource.destroy()
      process.exit(1)
    }
  }
}
