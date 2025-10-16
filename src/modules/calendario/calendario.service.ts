import { AppDataSource } from '@config/data-source'
import { getRepositoryFactory } from '@config/typeorm.repository'
import { CitaEntity } from '@modules/citas/entities/citas.entity'
import { MedicalRecordEntity } from '@modules/citas/entities/medical_record.entity'
import dayjs from 'dayjs'
import { DataSource, Repository } from 'typeorm'

export class CalendarioService {
  private readonly dataSource: DataSource
  private readonly citaRepository: Repository<CitaEntity>
  private readonly medicalRecordRepository: Repository<MedicalRecordEntity>

  constructor() {
    this.dataSource = AppDataSource
    this.citaRepository = getRepositoryFactory(CitaEntity)
    this.medicalRecordRepository = getRepositoryFactory(MedicalRecordEntity)
  }
  async update(citaId: number, data: { state: string; notes: string }) {
    // Actualizar estado de la cita
    await this.citaRepository.update(citaId, {
      state_payment: data.state,
    })

    // Actualizar notas médicas
    await this.medicalRecordRepository.update(
      { appointment_id: citaId },
      { notes: data.notes }
    )

    return { success: true }
  }

  async calendar() {
    const appointments = await this.citaRepository.find({
      relations: [
        'horarios',
        'horarios.schedule_hour',
        'pet',
        'pet.owner',
        'veterinarian',
        'pagos',
        'medical_records',
      ],
      order: { id: 'DESC' },
    })

    const calendars = appointments
      .map((cita) => {
        // ✅ Validación por si no tiene horarios
        if (!cita.horarios || cita.horarios.length === 0) {
          return null
        }

        const horario = cita.horarios[0]
        const hourStart = horario.schedule_hour.hour_start
        const hourEnd = horario.schedule_hour.hour_end

        const dateStr = dayjs(cita.day_appointment).format('YYYY-MM-DD')
        const notes =
          cita.medical_records && cita.medical_records.length > 0
            ? cita.medical_records[0].notes
            : ''
        return {
          id: cita.id,
          title: cita.pet.name,
          start: dayjs(`${dateStr} ${hourStart}`).format('YYYY-MM-DD HH:mm:ss'),
          end: dayjs(`${dateStr} ${hourEnd}`).format('YYYY-MM-DD HH:mm:ss'),
          allDay: false,
          url: '',
          extendedProps: {
            calendar: 'Appointment',
            description: cita.reason,
            notes: notes,
            day: cita.day,
            state: cita.state_payment,
            amount:
              cita.pagos && cita.pagos.length > 0 ? cita.pagos[0].monto : 0,
            veterinarie: {
              full_name: `${cita.veterinarian.username} `,
              role: {
                name: cita.veterinarian.roles?.name || '',
              },
            },
            pet: {
              id: cita.pet.id,
              name: cita.pet.name,
              specie: cita.pet.species,
              breed: cita.pet.breed,
              photo: cita.pet.photo,
              owner: {
                id: cita.pet.owner.id,
                first_name: cita.pet.owner.first_name,
                last_name: cita.pet.owner.last_name,
                phone: cita.pet.owner.phone,
                n_document: cita.pet.owner.n_documento,
              },
            },
          },
        }
      })
      .filter((item) => item !== null)

    return { calendars }
  }
}
