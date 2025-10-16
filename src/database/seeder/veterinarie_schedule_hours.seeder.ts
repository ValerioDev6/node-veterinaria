import { getRepositoryFactory } from '@config/typeorm.repository'
import { VeterinarianScheduleHourEntity } from '@modules/user/entities/veterinarian_schedule_hours.entity'
import { Repository } from 'typeorm'
import { BaseSeeder } from './base.seeder'

export class VeterinarianScheduleHoursSeeder extends BaseSeeder {
  private veterinarianScheduleHoursRepository: Repository<VeterinarianScheduleHourEntity>

  constructor() {
    super()
    this.veterinarianScheduleHoursRepository = getRepositoryFactory(
      VeterinarianScheduleHourEntity
    )
  }

  async run(): Promise<void> {
    this.logger.log('Starting veterinarian schedule hours seeding...')

    // Definir todos los horarios de 15 minutos desde 08:00 hasta 18:00
    const scheduleHours = [
      // 08:00 - 09:00
      { id: 1, hour_start: '08:00:00', hour_end: '08:15:00', hour: '08' },
      { id: 2, hour_start: '08:15:00', hour_end: '08:30:00', hour: '08' },
      { id: 3, hour_start: '08:30:00', hour_end: '08:45:00', hour: '08' },
      { id: 4, hour_start: '08:45:00', hour_end: '09:00:00', hour: '08' },
      // 09:00 - 10:00
      { id: 5, hour_start: '09:00:00', hour_end: '09:15:00', hour: '09' },
      { id: 6, hour_start: '09:15:00', hour_end: '09:30:00', hour: '09' },
      { id: 7, hour_start: '09:30:00', hour_end: '09:45:00', hour: '09' },
      { id: 8, hour_start: '09:45:00', hour_end: '10:00:00', hour: '09' },
      // 10:00 - 11:00
      { id: 9, hour_start: '10:00:00', hour_end: '10:15:00', hour: '10' },
      { id: 10, hour_start: '10:15:00', hour_end: '10:30:00', hour: '10' },
      { id: 11, hour_start: '10:30:00', hour_end: '10:45:00', hour: '10' },
      { id: 12, hour_start: '10:45:00', hour_end: '11:00:00', hour: '10' },
      // 11:00 - 12:00
      { id: 13, hour_start: '11:00:00', hour_end: '11:15:00', hour: '11' },
      { id: 14, hour_start: '11:15:00', hour_end: '11:30:00', hour: '11' },
      { id: 15, hour_start: '11:30:00', hour_end: '11:45:00', hour: '11' },
      { id: 16, hour_start: '11:45:00', hour_end: '12:00:00', hour: '11' },
      // 12:00 - 13:00
      { id: 17, hour_start: '12:00:00', hour_end: '12:15:00', hour: '12' },
      { id: 18, hour_start: '12:15:00', hour_end: '12:30:00', hour: '12' },
      { id: 19, hour_start: '12:30:00', hour_end: '12:45:00', hour: '12' },
      { id: 20, hour_start: '12:45:00', hour_end: '13:00:00', hour: '12' },
      // 13:00 - 14:00
      { id: 21, hour_start: '13:00:00', hour_end: '13:15:00', hour: '13' },
      { id: 22, hour_start: '13:15:00', hour_end: '13:30:00', hour: '13' },
      { id: 23, hour_start: '13:30:00', hour_end: '13:45:00', hour: '13' },
      { id: 24, hour_start: '13:45:00', hour_end: '14:00:00', hour: '13' },
      // 14:00 - 15:00
      { id: 25, hour_start: '14:00:00', hour_end: '14:15:00', hour: '14' },
      { id: 26, hour_start: '14:15:00', hour_end: '14:30:00', hour: '14' },
      { id: 27, hour_start: '14:30:00', hour_end: '14:45:00', hour: '14' },
      { id: 28, hour_start: '14:45:00', hour_end: '15:00:00', hour: '14' },
      // 15:00 - 16:00
      { id: 29, hour_start: '15:00:00', hour_end: '15:15:00', hour: '15' },
      { id: 30, hour_start: '15:15:00', hour_end: '15:30:00', hour: '15' },
      { id: 31, hour_start: '15:30:00', hour_end: '15:45:00', hour: '15' },
      { id: 32, hour_start: '15:45:00', hour_end: '16:00:00', hour: '15' },
      // 16:00 - 17:00
      { id: 33, hour_start: '16:00:00', hour_end: '16:15:00', hour: '16' },
      { id: 34, hour_start: '16:15:00', hour_end: '16:30:00', hour: '16' },
      { id: 35, hour_start: '16:30:00', hour_end: '16:45:00', hour: '16' },
      { id: 36, hour_start: '16:45:00', hour_end: '17:00:00', hour: '16' },
      // 17:00 - 18:00
      { id: 37, hour_start: '17:00:00', hour_end: '17:15:00', hour: '17' },
      { id: 38, hour_start: '17:15:00', hour_end: '17:30:00', hour: '17' },
      { id: 39, hour_start: '17:30:00', hour_end: '17:45:00', hour: '17' },
      { id: 40, hour_start: '17:45:00', hour_end: '18:00:00', hour: '17' },
    ]

    let created = 0
    let existing = 0

    for (const hourData of scheduleHours) {
      const exists = await this.veterinarianScheduleHoursRepository.findOne({
        where: { id: hourData.id },
      })

      if (!exists) {
        const scheduleHour = this.veterinarianScheduleHoursRepository.create({
          id: hourData.id,
          hour_start: hourData.hour_start,
          hour_end: hourData.hour_end,
          hour: hourData.hour,
        })

        await this.veterinarianScheduleHoursRepository.save(scheduleHour)
        this.logger.success(
          `Schedule hour created: ${hourData.hour_start} - ${hourData.hour_end}`
        )
        created++
      } else {
        this.logger.warn(
          `Schedule hour already exists: ${hourData.hour_start} - ${hourData.hour_end}`
        )
        existing++
      }
    }

    this.logger.info(
      `Schedule hours created: ${created}, already existing: ${existing}`
    )
    this.logger.success('Veterinarian schedule hours seeding completed!')
  }
}
