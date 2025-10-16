import { AppDataSource } from '@config/data-source'
import { getRepositoryFactory } from '@config/typeorm.repository'
import { MedicalRecordEntity } from '@modules/citas/entities/medical_record.entity'
import { Logger } from '@shared/logger/logger'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { DataSource, Repository } from 'typeorm'
import { VacunasPaginationDto } from './dto/vacunas.pagination.dto'
import { VacunasHorariasEntity } from './entities/horarios_vacunas.entity'
import { VacunaEntity } from './entities/vacunas.entity'
import { VacunasPagosEntity } from './entities/vacunas_pagos.entity'
dayjs.extend(utc)
dayjs.extend(timezone)
export class VacunaService {
  private readonly datasource: DataSource
  private readonly vacunasRepository: Repository<VacunaEntity>
  private readonly vacunasHorariosRepository: Repository<VacunasHorariasEntity>
  private readonly vacunasMetodoPagoRepository: Repository<VacunasPagosEntity>
  private readonly medicalRecordRepository: Repository<MedicalRecordEntity>
  private readonly logger = new Logger('VacunasService')

  constructor() {
    this.datasource = AppDataSource
    this.vacunasRepository = getRepositoryFactory(VacunaEntity)
    this.vacunasHorariosRepository = getRepositoryFactory(VacunasHorariasEntity)
    this.medicalRecordRepository = getRepositoryFactory(MedicalRecordEntity)
    this.vacunasMetodoPagoRepository = getRepositoryFactory(VacunasPagosEntity)
  }

  async getAllVacines(paginationDto: VacunasPaginationDto) {
    const {
      page,
      limit,
      petName,
      species,
      veterinarianName,
      state_payment,
      dateFrom,
      dateTo,
    } = paginationDto

    try {
      const queryBuilder = this.vacunasRepository
        .createQueryBuilder('vacunas')
        .leftJoinAndSelect('vacunas.pet', 'pet')
        .leftJoinAndSelect('vacunas.veterinarian', 'veterinarian')
        .leftJoinAndSelect('vacunas.pagos', 'pagos')

      // 🔍 Filtro por nombre de mascota
      if (petName) {
        queryBuilder.andWhere('LOWER(pet.name) LIKE LOWER(:petName)', {
          petName: `%${petName}%`,
        })
      }

      // 🔍 Filtro por especie
      if (species) {
        queryBuilder.andWhere('LOWER(pet.species) LIKE LOWER(:species)', {
          species: `%${species}%`,
        })
      }

      // 🔍 Filtro por nombre de veterinario
      if (veterinarianName) {
        queryBuilder.andWhere(
          'LOWER(veterinarian.username) LIKE LOWER(:veterinarianName)',
          {
            veterinarianName: `%${veterinarianName}%`,
          }
        )
      }

      // 🔍 Filtro por estado de pago
      if (state_payment) {
        queryBuilder.andWhere(
          'LOWER(vacunas.state_payment) = LOWER(:state_payment)',
          {
            state_payment,
          }
        )
      }

      // 🔍 Filtro por rango de fechas
      if (dateFrom) {
        queryBuilder.andWhere('vacunas.vaccination_day >= :dateFrom', {
          dateFrom: new Date(dateFrom + 'T00:00:00'),
        })
      }

      if (dateTo) {
        queryBuilder.andWhere('vacunas.vaccination_day <= :dateTo', {
          dateTo: new Date(dateTo + 'T23:59:59'),
        })
      }

      // Aplicar paginación y ordenamiento
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('vacunas.vaccination_day', 'DESC')

      const [citas, total] = await queryBuilder.getManyAndCount()

      // Construir query params para next/prev
      const buildQueryParams = () => {
        const params = []
        if (petName) params.push(`petName=${petName}`)
        if (species) params.push(`species=${species}`)
        if (veterinarianName)
          params.push(`veterinarianName=${veterinarianName}`)
        if (state_payment) params.push(`state_payment=${state_payment}`)
        if (dateFrom) params.push(`dateFrom=${dateFrom}`)
        if (dateTo) params.push(`dateTo=${dateTo}`)
        return params.length > 0 ? '&' + params.join('&') : ''
      }

      const queryParams = buildQueryParams()

      return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        next:
          page * limit < total
            ? `${process.env.URL_ENV}/citas?page=${
                page + 1
              }&limit=${limit}${queryParams}`
            : null,
        prev:
          page - 1 > 0
            ? `${process.env.URL_ENV}/citas?page=${
                page - 1
              }&limit=${limit}${queryParams}`
            : null,
        vacunas: citas.map((cita) => ({
          id: cita.id,
          vaccination_day: cita.vaccination_day,
          reason: cita.reason,
          state_payment: cita.state_payment,
          pet: {
            id: cita.pet.id,
            name: cita.pet.name,
            species: cita.pet.species,
            breed: cita.pet.breed,
          },
          veterinarian: {
            id: cita.veterinarian.id,
            username: cita.veterinarian.username,
            email: cita.veterinarian.email,
          },
          pagos: cita.pagos.map((pago) => ({
            id: pago.id,
            monto: pago.monto,
            adelanto: pago.adelanto,
            metodo_pago: pago.metodo_pago,
            estado: pago.estado,
          })),
        })),
      }
    } catch (error) {
      throw new Error(`Error al obtener las vacunas médicas: ${error}`)
    }
  }

  async store(data: any, userId: string) {
    const queryRunner = this.datasource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      this.logger.log('🚀 Iniciando creación de vacunas')
      this.logger.log(`📋 Data recibida: ${JSON.stringify(data)}`)

      const appointmentDate = dayjs(data.date_appointment)
        .tz('America/Lima')
        .toDate()

      if (isNaN(appointmentDate.getTime())) {
        throw new Error('Fecha de cita inválida')
      }

      this.logger.log('CREANDO CITA ..........')
      // create vacuna
      const vacunas = queryRunner.manager.create(VacunaEntity, {
        veterinarian_id: data.veterinarian_id,
        pet_id: data.pet_id,
        day: data.day,
        vaccination_day: appointmentDate,
        reason: data.reason,
        state_payment: data.state_payment,
        outside: data.outside,
        next_due_date: data.next_due_date,
        vaccine_names: data.vaccine_names,
        user_id: userId,
      })

      const vacunaSave = await queryRunner.manager.save(VacunaEntity, vacunas)
      this.logger.log(`✅ Cita guardada con ID: ${vacunaSave.id}`)

      // create medical Record
      this.logger.log('📋 Creando registro médico...')

      const medicalRecord = queryRunner.manager.create(MedicalRecordEntity, {
        veterinarian_id: data.veterinarian_id,
        pet_id: data.pet_id,
        event_type: 1,
        event_date: appointmentDate.getTime(),
        vaccination_id: vacunaSave.id,
      })

      await queryRunner.manager.save(MedicalRecordEntity, medicalRecord)
      this.logger.log('✅ Registro médico guardado')

      const pago = queryRunner.manager.create(VacunasPagosEntity, {
        vacuna_id: vacunaSave.id,
        monto: data.monto,
        adelanto: data.adelanto,
        metodo_pago: data.metodo_pago,
        estado: 'pendiente',
      })

      await queryRunner.manager.save(VacunasPagosEntity, pago)
      this.logger.log('✅ Pago guardado')

      // 4️⃣ Create appointment time slots
      this.logger.log(
        `⏰ Guardando ${data.selected_segment_times.length} horarios...`
      )

      for (const segmentTime of data.selected_segment_times) {
        this.logger.log(` → Horario ID: ${segmentTime.segment_time_id}`)

        const horario = queryRunner.manager.create(VacunasHorariasEntity, {
          vaccination_id: vacunaSave.id,
          veterinarie_schedule_hour_id: segmentTime.segment_time_id,
        })

        await queryRunner.manager.save(VacunasHorariasEntity, horario)
      }

      this.logger.log('✅ Todos los horarios guardados')
      this.logger.log('🎉 Vacuna creada exitosamente')

      await queryRunner.commitTransaction()
      return {
        statusCode: 200,
        message: 'Vacuna creada exitosamente',
        data: vacunaSave,
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction()
      this.logger.error(`❌ Error al crear cita: ${error.message}`)
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async update(vacunaId: number, data: any, userId: string) {
    const queryRunner = this.datasource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      this.logger.log(`🔄 Iniciando actualización de cita ID: ${vacunaId}`)
      this.logger.log(`📋 Data recibida: ${JSON.stringify(data)}`)
      this.logger.log(`👤 User ID: ${userId}`)

      return await this.datasource.transaction(
        async (transactionalEntityManager) => {
          // 1. Verificar que la cita existe
          const vacunaExists = await this.vacunasRepository.findOne({
            where: { id: vacunaId },
          })

          if (!vacunaExists) {
            throw new Error('Vacuna no encontrada')
          }

          this.logger.log(`✅ Cita encontrada: ${vacunaExists.id}`)

          // Parsear la fecha si viene
          let appointmentDate = vacunaExists.vaccination_day
          let dayName = vacunaExists.day

          if (data.date_appointment) {
            appointmentDate = new Date(data.date_appointment + 'T00:00:00.000Z')
            if (isNaN(appointmentDate.getTime())) {
              throw new Error('Fecha de cita inválida')
            }
            dayName = data.day || dayName
          }

          // 2. Actualizar la cita
          this.logger.log('🔄 Acutalizando vacuna...')
          await transactionalEntityManager.update(
            VacunaEntity,
            { id: vacunaId },
            {
              veterinarian_id:
                data.veterinarian_id ?? vacunaExists.veterinarian_id,
              pet_id: data.pet_id ?? vacunaExists.pet_id,
              day: dayName,
              // vaccine_names
              vaccination_day: appointmentDate,
              reason: data.reason ?? vacunaExists.reason,
              next_due_date: data.next_due_date,
              outside: data.outside,
              state_payment: data.state_payment ?? vacunaExists.state_payment,
            }
          )
          this.logger.log('✅ Vacuna actualizada')

          // 3. Actualizar el registro médico si cambió el veterinario o la fecha
          // if (data.veterinarian_id || data.date_appointment) {
          //   this.logger.log('🔄 Actualizando registro médico...')
          //   await transactionalEntityManager.update(
          //     MedicalRecordEntity,
          //     { appointment_id: citaId },
          //     {
          //       veterinarian_id:
          //         data.veterinarian_id ?? citaExistente.veterinarian_id,
          //       event_date: appointmentDate.getTime(),
          //     }
          //   )
          //   this.logger.log('✅ Registro médico actualizado')
          // }

          // 4. Actualizar el pago si viene
          if (
            data.monto !== undefined ||
            data.adelanto !== undefined ||
            data.metodo_pago
          ) {
            this.logger.log('🔄 Actualizando pago...')
            // await transactionalEntityManager.update(
            //   PagoEntity,
            //   { cita_id: citaId },
            //   {
            //     monto: data.monto,
            //     adelanto: data.adelanto,
            //     metodo_pago: data.metodo_pago,
            //   }
            // )
            this.logger.log('✅ Pago actualizado')
          }

          // 5. Actualizar horarios si vienen nuevos
          if (
            data.selected_segment_times &&
            data.selected_segment_times.length > 0
          ) {
            this.logger.log('🔄 Actualizando horarios...')

            // Eliminar horarios anteriores
            // await transactionalEntityManager.delete(HorarioCitas, {
            //   appointment_id: citaId,
            // })

            // Crear nuevos horarios
            // for (const segmentTime of data.selected_segment_times) {
            //   const horario = this.citaHorarioRepository.create({
            //     appointment_id: citaId,
            //     veterinarie_schedule_hour_id: segmentTime.segment_time_id,
            //   })
            //   await transactionalEntityManager.save(HorarioCitas, horario)
            // }
            // this.logger.log('✅ Horarios actualizados')
          }

          // Obtener la cita actualizada
          // const citaActualizada = await this.citaRepository.findOne({
          //   where: { id: citaId },
          // })

          this.logger.log('🎉 Cita actualizada exitosamente')
          return {
            message: 200,
            // data: citaActualizada,
          }
        }
      )
    } catch (error) {}
  }
}
