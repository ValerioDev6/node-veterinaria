import { VeterinarianScheduleDayEntity } from '@modules/user/entities/veterinarian_schedule_days.entity'
import { VeterinarianScheduleJoinEntity } from '@modules/user/entities/veterinarian_schedule_joins.entity'
import { Logger } from '@shared/logger/logger'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { Repository } from 'typeorm'
import { DataSource } from 'typeorm/browser'
import { AppDataSource } from '../../../config/data-source'
import { getRepositoryFactory } from '../../../config/typeorm.repository'
import { PacienteEntity } from '../../pacientes/entities/paciente.entity'
import { UserEntity } from '../../user/entities/user.entity'
import { CitaPaginationDto } from '../dto/cita_pagination'
import { CitaEntity } from '../entities/citas.entity'
import { HorarioCitas } from '../entities/horario_citas.entity'
import { MedicalRecordEntity } from '../entities/medical_record.entity'
import { PagoEntity } from '../entities/pago.entity'

dayjs.extend(utc)
dayjs.extend(timezone)

interface FilterCitaDto {
  date_appointment: string // "2024-10-15"
  hour?: string // "14:30" (opcional)
}

export class CitasService {
  private readonly petRepository: Repository<PacienteEntity>
  private readonly citaRepository: Repository<CitaEntity>
  private readonly veterinarioRepository: Repository<UserEntity>
  private readonly citaHorarioRepository: Repository<HorarioCitas>
  private readonly medicalRecordRepository: Repository<MedicalRecordEntity>
  private readonly pagoRepository: Repository<PagoEntity>
  private readonly veterinarianSheduleDays: Repository<VeterinarianScheduleDayEntity>
  private readonly veterinarianSheduleJoins: Repository<VeterinarianScheduleJoinEntity>
  private logger = new Logger('CitasService')

  private readonly dataSource: DataSource

  constructor() {
    this.petRepository = getRepositoryFactory(PacienteEntity)
    this.veterinarioRepository = getRepositoryFactory(UserEntity)
    this.pagoRepository = getRepositoryFactory(PagoEntity)
    this.citaRepository = getRepositoryFactory(CitaEntity)
    this.citaHorarioRepository = getRepositoryFactory(HorarioCitas)
    this.medicalRecordRepository = getRepositoryFactory(MedicalRecordEntity)
    this.veterinarianSheduleDays = getRepositoryFactory(
      VeterinarianScheduleDayEntity
    )
    this.veterinarianSheduleJoins = getRepositoryFactory(
      VeterinarianScheduleJoinEntity
    )
    this.dataSource = AppDataSource
  }
  async filter(data: FilterCitaDto) {
    const { date_appointment, hour } = data

    // 1. Obtener nombre del día en inglés (monday, tuesday, etc)
    const dateLima = dayjs.tz(date_appointment, 'America/Lima')
    const dayName = dateLima.format('dddd').toLowerCase()

    // 2. Obtener veterinarios que atienden ese día
    const veterinarieDays = await this.veterinarianSheduleDays
      .createQueryBuilder('vsd')
      .leftJoinAndSelect('vsd.veterinarian', 'vet')
      .where('LOWER(vsd.day) = :day', { day: dayName })
      .orderBy('vsd.veterinarian_id', 'ASC')
      .getMany()

    const veterinarieTimeAvailability = []

    // 3. Procesar cada veterinario
    for (const veterinarieDay of veterinarieDays) {
      const segmentTimeFormats = []

      // Obtener los joins de horarios para este día
      let queryJoins = this.veterinarianSheduleJoins
        .createQueryBuilder('vsj')
        .leftJoinAndSelect('vsj.schedule_hour', 'hour')
        .where('vsj.veterinarian_schedule_day_id = :dayId', {
          dayId: veterinarieDay.id,
        })

      // Filtrar por hora si existe
      if (hour) {
        const hourPart = hour.padStart(2, '0') // "8" -> "08"
        queryJoins = queryJoins.andWhere('hour.hour = :hourPart', { hourPart })
      }

      const segmentTimeJoins = await queryJoins.getMany()

      // Procesar cada segmento de tiempo
      for (const segmentTimeJoin of segmentTimeJoins) {
        // Verificar si el horario está ocupado
        const check = await this.citaHorarioRepository
          .createQueryBuilder('hc')
          .innerJoin('hc.cita', 'cita')
          .where('DATE(cita.day_appointment) = DATE(:date)', {
            date: date_appointment,
          })
          // .andWhere('cita.state != :cancelado', { cancelado: '2' })
          .andWhere('cita.veterinarian_id = :vetId', {
            vetId: veterinarieDay.veterinarian_id,
          })
          .andWhere('hc.veterinarie_schedule_hour_id = :hourId', {
            hourId: segmentTimeJoin.veterinarian_schedule_hour_id,
          })
          .getOne()

        const scheduleHour = segmentTimeJoin.schedule_hour

        segmentTimeFormats.push({
          id: segmentTimeJoin.id,
          veterinarie_schedule_day_id:
            segmentTimeJoin.veterinarian_schedule_day_id,
          veterinarie_schedule_hour_id:
            segmentTimeJoin.veterinarian_schedule_hour_id,
          hour: scheduleHour.hour,
          schedule_hour: {
            hour_start: scheduleHour.hour_start,
            hour_end: scheduleHour.hour_end,
            hour: scheduleHour.hour,
            hour_start_format: this.formatHour(scheduleHour.hour_start),
            hour_end_format: this.formatHour(scheduleHour.hour_end),
          },
          check: !!check,
        })
      }

      // 4. Agrupar segmentos por hora
      const segmentTimeGroups = []
      const groupedByHour = this.groupBy(segmentTimeFormats, 'hour')

      for (const [hourT, segments] of Object.entries(groupedByHour)) {
        const countAvailability = (segments as any[]).filter(
          (s) => !s.check
        ).length

        segmentTimeGroups.push({
          hour: hourT,
          hour_format: this.formatHour(`${hourT}:00:00`),
          segment_times: segments,
          count_availability: countAvailability,
        })
      }

      // Solo agregar si tiene horarios
      if (segmentTimeGroups.length > 0) {
        veterinarieTimeAvailability.push({
          id: veterinarieDay.veterinarian_id,
          full_name: veterinarieDay.veterinarian.username,
          segment_time_groups: segmentTimeGroups,
        })
      }
    }

    return {
      veterinarie_time_availability: veterinarieTimeAvailability,
    }
  }

  // Helper: Formatear hora a AM/PM
  private formatHour(time: string): string {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Helper: Agrupar array por llave
  private groupBy(array: any[], key: string) {
    return array.reduce((result, item) => {
      const groupKey = item[key]
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    }, {} as Record<string, any[]>)
  }
  async getAllCitas(paginationDto: CitaPaginationDto) {
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
      const queryBuilder = this.citaRepository
        .createQueryBuilder('cita')
        .leftJoinAndSelect('cita.pet', 'pet')
        .leftJoinAndSelect('cita.veterinarian', 'veterinarian')
        .leftJoinAndSelect('cita.pagos', 'pagos')

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
          'LOWER(cita.state_payment) = LOWER(:state_payment)',
          {
            state_payment,
          }
        )
      }

      // 🔍 Filtro por rango de fechas
      if (dateFrom) {
        queryBuilder.andWhere('cita.day_appointment >= :dateFrom', {
          dateFrom: new Date(dateFrom + 'T00:00:00'),
        })
      }

      if (dateTo) {
        queryBuilder.andWhere('cita.day_appointment <= :dateTo', {
          dateTo: new Date(dateTo + 'T23:59:59'),
        })
      }

      // Aplicar paginación y ordenamiento
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('cita.day_appointment', 'DESC')

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
        citas: citas.map((cita) => ({
          id: cita.id,
          day_appointment: cita.day_appointment,
          reason: cita.reason,
          reprograming: cita.reprograming,
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
      throw new Error(`Error al obtener las citas médicas: ${error}`)
    }
  }

  async getPacientes(): Promise<PacienteEntity[]> {
    const pacientes = await this.petRepository.find()
    return pacientes
  }

  async getCitaById(citaId: number) {
    this.logger.log(`🔍 Obteniendo cita ID: ${citaId}`)

    try {
      const cita = await this.citaRepository
        .createQueryBuilder('cita')
        .leftJoinAndSelect('cita.pet', 'pet')
        .leftJoinAndSelect('cita.veterinarian', 'veterinarian')
        .leftJoinAndSelect('cita.pagos', 'pagos')
        .leftJoinAndSelect('cita.horarios', 'horarios')
        .leftJoinAndSelect('horarios.schedule_hour', 'schedule_hour')
        .where('cita.id = :citaId', { citaId })
        .getOne()

      if (!cita) {
        throw new Error('Cita no encontrada')
      }

      this.logger.log(`✅ Cita encontrada: ${cita.id}`)

      // Formatear la respuesta para el frontend
      return {
        id: cita.id,
        day: cita.day,
        date_appointment: cita.day_appointment,
        reason: cita.reason,
        reprograming: cita.reprograming,
        state_payment: cita.state_payment,
        veterinarian_id: cita.veterinarian_id,
        pet_id: cita.pet_id,

        // Datos de la mascota
        pet: {
          id: cita.pet.id,
          name: cita.pet.name,
          species: cita.pet.species,
          breed: cita.pet.breed,
        },

        // Datos del veterinario
        veterinarian: {
          id: cita.veterinarian.id,
          username: cita.veterinarian.username,
          email: cita.veterinarian.email,
        },

        // Datos del pago
        pago:
          cita.pagos.length > 0
            ? {
                id: cita.pagos[0].id,
                monto: cita.pagos[0].monto,
                adelanto: cita.pagos[0].adelanto,
                metodo_pago: cita.pagos[0].metodo_pago,
                estado: cita.pagos[0].estado,
              }
            : null,

        // Horarios seleccionados (para pre-seleccionar en el frontend)
        selected_segment_times: cita.horarios.map((horario) => ({
          id: horario.id,
          segment_time_id: horario.veterinarie_schedule_hour_id,
          schedule_hour: horario.schedule_hour
            ? {
                hour: horario.schedule_hour.hour,
                hour_start: horario.schedule_hour.hour_start,
                hour_end: horario.schedule_hour.hour_end,
                hour_start_format: this.formatHour(
                  horario.schedule_hour.hour_start
                ),
                hour_end_format: this.formatHour(
                  horario.schedule_hour.hour_end
                ),
              }
            : null,
        })),
      }
    } catch (error: any) {
      this.logger.error(`❌ Error al obtener cita: ${error.message}`)
      throw new Error(`Error al obtener la cita: ${error.message}`)
    }
  }

  async update(citaId: number, data: any, userId: string) {
    this.logger.log(`🔄 Iniciando actualización de cita ID: ${citaId}`)
    this.logger.log(`📋 Data recibida: ${JSON.stringify(data)}`)
    this.logger.log(`👤 User ID: ${userId}`)

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // 1. Verificar que la cita existe
        const citaExistente = await this.citaRepository.findOne({
          where: { id: citaId },
        })

        if (!citaExistente) {
          throw new Error('Cita no encontrada')
        }

        this.logger.log(`✅ Cita encontrada: ${citaExistente.id}`)

        // Parsear la fecha si viene
        let appointmentDate = citaExistente.day_appointment
        let dayName = citaExistente.day

        if (data.date_appointment) {
          appointmentDate = new Date(data.date_appointment + 'T00:00:00.000Z')
          if (isNaN(appointmentDate.getTime())) {
            throw new Error('Fecha de cita inválida')
          }
          dayName = data.day || dayName
        }

        // 2. Actualizar la cita
        this.logger.log('🔄 Actualizando cita...')
        await transactionalEntityManager.update(
          CitaEntity,
          { id: citaId },
          {
            veterinarian_id:
              data.veterinarian_id ?? citaExistente.veterinarian_id,
            pet_id: data.pet_id ?? citaExistente.pet_id,
            day: dayName,
            day_appointment: appointmentDate,
            reason: data.reason ?? citaExistente.reason,
            reprograming: data.reprograming ?? citaExistente.reprograming,
            state_payment: data.state_payment ?? citaExistente.state_payment,
          }
        )
        this.logger.log('✅ Cita actualizada')

        // 3. Actualizar el registro médico si cambió el veterinario o la fecha
        if (data.veterinarian_id || data.date_appointment) {
          this.logger.log('🔄 Actualizando registro médico...')
          await transactionalEntityManager.update(
            MedicalRecordEntity,
            { appointment_id: citaId },
            {
              veterinarian_id:
                data.veterinarian_id ?? citaExistente.veterinarian_id,
              event_date: appointmentDate.getTime(),
            }
          )
          this.logger.log('✅ Registro médico actualizado')
        }

        // 4. Actualizar el pago si viene
        if (
          data.monto !== undefined ||
          data.adelanto !== undefined ||
          data.metodo_pago
        ) {
          this.logger.log('🔄 Actualizando pago...')
          await transactionalEntityManager.update(
            PagoEntity,
            { cita_id: citaId },
            {
              monto: data.monto,
              adelanto: data.adelanto,
              metodo_pago: data.metodo_pago,
            }
          )
          this.logger.log('✅ Pago actualizado')
        }

        // 5. Actualizar horarios si vienen nuevos
        if (
          data.selected_segment_times &&
          data.selected_segment_times.length > 0
        ) {
          this.logger.log('🔄 Actualizando horarios...')

          // Eliminar horarios anteriores
          await transactionalEntityManager.delete(HorarioCitas, {
            appointment_id: citaId,
          })

          // Crear nuevos horarios
          for (const segmentTime of data.selected_segment_times) {
            const horario = this.citaHorarioRepository.create({
              appointment_id: citaId,
              veterinarie_schedule_hour_id: segmentTime.segment_time_id,
            })
            await transactionalEntityManager.save(HorarioCitas, horario)
          }
          this.logger.log('✅ Horarios actualizados')
        }

        // Obtener la cita actualizada
        const citaActualizada = await this.citaRepository.findOne({
          where: { id: citaId },
        })

        this.logger.log('🎉 Cita actualizada exitosamente')
        return {
          message: 200,
          data: citaActualizada,
        }
      }
    )
  }

  async delete(citaId: number): Promise<{ message: string }> {
    this.logger.log(`🗑️ Iniciando eliminación de cita ID: ${citaId}`)

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // 1. Verificar que la cita existe
        const cita = await this.citaRepository.findOne({
          where: { id: citaId },
        })

        if (!cita) {
          throw new Error('Cita no encontrada')
        }

        this.logger.log(`✅ Cita encontrada: ${cita.id}`)

        // 2. Eliminar horarios de la cita
        this.logger.log('🗑️ Eliminando horarios...')
        await transactionalEntityManager.delete(HorarioCitas, {
          appointment_id: citaId,
        })
        this.logger.log('✅ Horarios eliminados')

        // 3. Eliminar pagos
        this.logger.log('🗑️ Eliminando pagos...')
        await transactionalEntityManager.delete(PagoEntity, {
          cita_id: citaId,
        })
        this.logger.log('✅ Pagos eliminados')

        // 4. Eliminar la cita (medical_record se mantiene para historial)
        this.logger.log('🗑️ Eliminando cita...')
        await transactionalEntityManager.delete(CitaEntity, { id: citaId })
        this.logger.log('✅ Cita eliminada')

        this.logger.log(
          '🎉 Cita eliminada exitosamente (historial médico conservado)'
        )

        return {
          message: 'Cita eliminada exitosamente',
        }
      }
    )
  }
  async getVeterinarios(): Promise<UserEntity[]> {
    const veterinarios = await this.veterinarioRepository.find()
    return veterinarios
  }

  async store(data: any, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      this.logger.log('🚀 Iniciando creación de cita')
      this.logger.log(`📋 Data recibida: ${JSON.stringify(data)}`)
      this.logger.log(`👤 User ID: ${userId}`)

      // ✅ Parse appointment date correctly
      const appointmentDate = dayjs(data.date_appointment)
        .tz('America/Lima')
        .toDate()

      if (isNaN(appointmentDate.getTime())) {
        throw new Error('Fecha de cita inválida')
      }

      // 1️⃣ Create appointment
      this.logger.log('💉 Creando cita...')
      const cita = queryRunner.manager.create(CitaEntity, {
        veterinarian_id: data.veterinarian_id,
        pet_id: data.pet_id,
        day: data.day,
        day_appointment: appointmentDate,
        reason: data.reason,
        reprograming: data.reprograming,
        state_payment: data.state_payment,
        user_id: userId,
      })

      const citaGuardada = await queryRunner.manager.save(CitaEntity, cita)
      this.logger.log(`✅ Cita guardada con ID: ${citaGuardada.id}`)

      // 2️⃣ Create medical record
      this.logger.log('📋 Creando registro médico...')
      const medicalRecord = queryRunner.manager.create(MedicalRecordEntity, {
        veterinarian_id: data.veterinarian_id,
        pet_id: data.pet_id,
        event_type: 1,
        event_date: appointmentDate.getTime(),
        appointment_id: citaGuardada.id,
      })

      await queryRunner.manager.save(MedicalRecordEntity, medicalRecord)
      this.logger.log('✅ Registro médico guardado')

      // 3️⃣ Create payment
      this.logger.log('💰 Creando pago...')
      const pago = queryRunner.manager.create(PagoEntity, {
        cita_id: citaGuardada.id,
        monto: data.monto,
        adelanto: data.adelanto,
        metodo_pago: data.metodo_pago,
        estado: 'pendiente',
      })

      await queryRunner.manager.save(PagoEntity, pago)
      this.logger.log('✅ Pago guardado')

      // 4️⃣ Create appointment time slots
      this.logger.log(
        `⏰ Guardando ${data.selected_segment_times.length} horarios...`
      )

      for (const segmentTime of data.selected_segment_times) {
        this.logger.log(` → Horario ID: ${segmentTime.segment_time_id}`)

        const horario = queryRunner.manager.create(HorarioCitas, {
          appointment_id: citaGuardada.id,
          veterinarie_schedule_hour_id: segmentTime.segment_time_id,
        })

        await queryRunner.manager.save(HorarioCitas, horario)
      }

      this.logger.log('✅ Todos los horarios guardados')
      this.logger.log('🎉 Cita creada exitosamente')

      await queryRunner.commitTransaction()

      return {
        statusCode: 200,
        message: 'Cita creada exitosamente',
        data: citaGuardada,
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction()
      this.logger.error(`❌ Error al crear cita: ${error.message}`)
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async getCalendarSheduleByDate() {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
  }
}
