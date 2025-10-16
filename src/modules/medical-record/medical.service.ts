import { getRepositoryFactory } from '@config/typeorm.repository'
import { MedicalRecordEntity } from '@modules/citas/entities/medical_record.entity'
import { DataSource, Repository } from 'typeorm'

export class MedicalRecordService {
  private readonly datasource: DataSource
  private readonly medicalRecordRepository: Repository<MedicalRecordEntity>
  constructor() {
    this.medicalRecordRepository = getRepositoryFactory(MedicalRecordEntity)
  }

  async getMedicalHistoryByPetName(petName: string, serviceType?: string) {
    try {
      const queryBuilder = this.medicalRecordRepository
        .createQueryBuilder('medical_record')
        .leftJoinAndSelect('medical_record.pet', 'pet')
        .leftJoinAndSelect('pet.owner', 'owner')
        .leftJoinAndSelect('medical_record.cita', 'cita')
        .leftJoinAndSelect('cita.pagos', 'citaPagos')
        .leftJoinAndSelect('cita.veterinarian', 'citaVeterinarian')
        .leftJoinAndSelect('cita.user', 'citaUser')
        .leftJoinAndSelect('medical_record.vacuna', 'vacuna')
        .leftJoinAndSelect('vacuna.pagos', 'vacunaPagos')
        .leftJoinAndSelect('vacuna.veterinarian', 'vacunaVeterinarian')
        .leftJoinAndSelect('vacuna.user', 'vacunaUser')
        .leftJoinAndSelect('medical_record.surgiere', 'surgiere')
        .leftJoinAndSelect('surgiere.pagos', 'surgierePagos')
        .leftJoinAndSelect('surgiere.veterinarian', 'surgiereVeterinarian')
        .leftJoinAndSelect('surgiere.user', 'surgiereUser')
        .leftJoinAndSelect('medical_record.veterinarian', 'veterinarian')
        .where('LOWER(pet.name) LIKE LOWER(:petName)', {
          petName: `%${petName}%`,
        })

      // Filtro por tipo de servicio - CORREGIDO CON NOMBRES REALES DE COLUMNAS
      if (serviceType && serviceType !== 'TODOS') {
        if (serviceType === 'CITA') {
          queryBuilder.andWhere('medical_record.appointment_id IS NOT NULL')
          queryBuilder.andWhere('medical_record.vaccination_id IS NULL')
          queryBuilder.andWhere('medical_record.surgerie_id IS NULL')
        } else if (serviceType === 'VACUNA') {
          queryBuilder.andWhere('medical_record.vaccination_id IS NOT NULL')
          queryBuilder.andWhere('medical_record.appointment_id IS NULL')
          queryBuilder.andWhere('medical_record.surgerie_id IS NULL')
        } else if (serviceType === 'CIRUGÍA') {
          queryBuilder.andWhere('medical_record.surgerie_id IS NOT NULL')
          queryBuilder.andWhere('medical_record.appointment_id IS NULL')
          queryBuilder.andWhere('medical_record.vaccination_id IS NULL')
        }
      }

      const records = await queryBuilder
        .orderBy('medical_record.event_date', 'DESC')
        .getMany()

      return {
        medical_records: records.map((record) => this.formatRecord(record)),
        total: records.length,
      }
    } catch (error) {
      throw new Error(`Error al obtener historial: ${error}`)
    }
  }

  private formatRecord(record: MedicalRecordEntity) {
    let serviceData = null
    let serviceType = null
    let createdByUser = null
    let serviceVeterinarian = null

    if (record.cita) {
      serviceType = 'CITA'
      createdByUser = record.cita.user
      serviceVeterinarian = record.cita.veterinarian
      const citaPago = record.cita.pagos?.[0]
      serviceData = {
        id: record.cita.id,
        date: record.cita.day_appointment,
        reason: record.cita.reason,
        state_payment: record.cita.state_payment,
        reprograming: record.cita.reprograming,
        monto: citaPago?.monto || 0,
        adelanto: citaPago?.adelanto || 0,
        metodo_pago: citaPago?.metodo_pago,
      }
    }

    if (record.vacuna) {
      serviceType = 'VACUNA'
      createdByUser = record.vacuna.user
      serviceVeterinarian = record.vacuna.veterinarian
      const vacunaPago = record.vacuna.pagos?.[0]
      serviceData = {
        id: record.vacuna.id,
        date: record.vacuna.vaccination_day,
        next_due_date: record.vacuna.next_due_date,
        vaccine_names: record.vacuna.vaccine_names,
        reason: record.vacuna.reason,
        state: record.vacuna.state,
        state_payment: record.vacuna.state_payment,
        outside: record.vacuna.outside,
        monto: vacunaPago?.monto || 0,
        adelanto: vacunaPago?.adelanto || 0,
        metodo_pago: vacunaPago?.metodo_pago,
      }
    }

    if (record.surgiere) {
      serviceType = 'CIRUGÍA'
      createdByUser = record.surgiere.user
      serviceVeterinarian = record.surgiere.veterinarian
      const surgierePago = record.surgiere.pagos?.[0]
      serviceData = {
        id: record.surgiere.id,
        date: record.surgiere.surgerie_date,
        surgerie_type: record.surgiere.surgerie_type,
        medical_notes: record.surgiere.medical_notes,
        outcome: record.surgiere.outcome,
        state: record.surgiere.state,
        state_payment: record.surgiere.state_payment,
        outside: record.surgiere.outside,
        monto: surgierePago?.monto || 0,
        adelanto: surgierePago?.adelanto || 0,
        metodo_pago: surgierePago?.metodo_pago,
      }
    }

    return {
      id: record.id,
      event_type: serviceType,
      event_date: record.event_date,
      notes: record.notes,

      // Datos del Pet (Mascota)
      pet: {
        id: record.pet?.id,
        name: record.pet?.name,
        species: record.pet?.species,
        breed: record.pet?.breed,
        birth_date: record.pet?.birth_date,
        gender: record.pet?.gender,
        color: record.pet?.color,
        weight: record.pet?.weight,
        photo: record.pet?.photo,
        medical_notes: record.pet?.medical_notes,
      },

      // Datos del Owner (Dueño)
      owner: {
        id: record.pet?.owner?.id,
        username: record.pet?.owner?.first_name,
        email: record.pet?.owner?.email,
        phone: record.pet?.owner?.phone,
        type_documento: record.pet?.owner?.type_documento,
        n_documento: record.pet?.owner?.n_documento,
      },

      // Usuario que registró el servicio (cita, vacuna o cirugía)
      created_by: {
        id: createdByUser?.id,
        username: createdByUser?.username,
        email: createdByUser?.email,
        phone: createdByUser?.phone,
        type_documento: createdByUser?.type_documento,
        n_documento: createdByUser?.n_documento,
      },

      // Veterinario asignado al servicio
      service_veterinarian: {
        id: serviceVeterinarian?.id,
        username: serviceVeterinarian?.username,
        email: serviceVeterinarian?.email,
        phone: serviceVeterinarian?.phone,
      },

      // Veterinario del medical record (si existe)
      record_veterinarian: {
        id: record.veterinarian?.id,
        username: record.veterinarian?.username,
        email: record.veterinarian?.email,
        phone: record.veterinarian?.phone,
      },

      service: serviceData,
      created_at: record.created_at,
    }
  }
  // private formatRecord(record: MedicalRecordEntity) {
  //   let serviceData = null
  //   let serviceType = null

  //   if (record.cita) {
  //     serviceType = 'CITA'
  //     const appointmentDate = dayjs(record.cita.day_appointment)
  //       .tz('America/Lima')
  //       .toDate()
  //     serviceData = {
  //       id: record.cita.id,
  //       date: appointmentDate,
  //       reason: record.cita.reason,
  //       state: record.cita.state,
  //       state_payment: record.cita.state_payment,
  //       monto: record.cita.monto,
  //     }
  //   }

  //   if (record.vacuna) {
  //     serviceType = 'VACUNA'
  //     const vaccinationDate = dayjs(record.vacuna.vaccination_day)
  //       .tz('America/Lima')
  //       .toDate()
  //     serviceData = {
  //       id: record.vacuna.id,
  //       date: vaccinationDate,
  //       vaccine_names: record.vacuna.vaccine_names,
  //       reason: record.vacuna.reason,
  //       state: record.vacuna.state,
  //       state_payment: record.vacuna.state_payment,
  //       monto: record.vacuna.monto,
  //     }
  //   }

  //   if (record.surgiere) {
  //     serviceType = 'CIRUGÍA'
  //     const surgerieDate = dayjs(record.surgiere.surgerie_date)
  //       .tz('America/Lima')
  //       .toDate()
  //     serviceData = {
  //       id: record.surgiere.id,
  //       date: surgerieDate,
  //       surgerie_type: record.surgiere.surgerie_type,
  //       medical_notes: record.surgiere.medical_notes,
  //       state: record.surgiere.state,
  //       state_payment: record.surgiere.state_payment,
  //       monto: record.surgiere.monto,
  //     }
  //   }

  //   const eventDate = dayjs(record.event_date).tz('America/Lima').toDate()

  //   return {
  //     id: record.id,
  //     event_type: serviceType,
  //     event_date: eventDate,
  //     notes: record.notes,
  //     veterinarian: {
  //       id: record.veterinarian?.id,
  //       name: record.veterinarian?.username,
  //       email: record.veterinarian?.email,
  //     },
  //     service: serviceData,
  //     created_at: record.created_at,
  //   }
  // }
}
