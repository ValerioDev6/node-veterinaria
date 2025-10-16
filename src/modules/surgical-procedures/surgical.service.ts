import { AppDataSource } from '@config/data-source'
import { getRepositoryFactory } from '@config/typeorm.repository'
import { MedicalRecordEntity } from '@modules/citas/entities/medical_record.entity'
import { Logger } from '@shared/logger/logger'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { DataSource, Repository } from 'typeorm'
import { CirugiaPaginationDto } from './dto/CirugiaPaginationDto'
import { SurgiereEntity } from './entities/surgiere.entity'
import { SurigerePaymentEntity } from './entities/surgiere_payment.entity'
import { SurigereSheduleEntity } from './entities/surgiere_shedule.entity'
dayjs.extend(utc)
dayjs.extend(timezone)
export class SurgicalService {
  private readonly dataSource: DataSource
  private readonly surgiereRespository: Repository<SurgiereEntity>
  private readonly surgierePaymentRespository: Repository<SurigerePaymentEntity>
  private readonly surgiereSheduleRespository: Repository<SurigereSheduleEntity>
  private logger = new Logger('SurgicalService')

  constructor() {
    this.dataSource = AppDataSource
    this.surgiereRespository = getRepositoryFactory(SurgiereEntity)
    this.surgierePaymentRespository = getRepositoryFactory(
      SurigerePaymentEntity
    )
    this.surgiereSheduleRespository = getRepositoryFactory(
      SurigereSheduleEntity
    )
    this.dataSource = AppDataSource
  }

  async getAllCirugia(paginationDto: CirugiaPaginationDto) {
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
      const queryBuilder = this.surgiereRespository
        .createQueryBuilder('surgiere')
        .leftJoinAndSelect('surgiere.pet', 'pet')
        .leftJoinAndSelect('surgiere.veterinarian', 'veterinarian')
        .leftJoinAndSelect('surgiere.pagos', 'pagos')

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
          'LOWER(surgiere.state_payment) = LOWER(:state_payment)',
          {
            state_payment,
          }
        )
      }

      // 🔍 Filtro por rango de fechas
      if (dateFrom) {
        queryBuilder.andWhere('surgiere.surgerie_date >= :dateFrom', {
          dateFrom: new Date(dateFrom + 'T00:00:00'),
        })
      }

      if (dateTo) {
        queryBuilder.andWhere('surgiere.surgerie_date <= :dateTo', {
          dateTo: new Date(dateTo + 'T23:59:59'),
        })
      }

      // Aplicar paginación y ordenamiento
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('surgiere.surgerie_date', 'DESC')

      const [cirujias, total] = await queryBuilder.getManyAndCount()

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
            ? `${process.env.URL_ENV}/cirujias?page=${
                page + 1
              }&limit=${limit}${queryParams}`
            : null,
        prev:
          page - 1 > 0
            ? `${process.env.URL_ENV}/cirujias?page=${
                page - 1
              }&limit=${limit}${queryParams}`
            : null,
        cirujias: cirujias.map((cirugia) => ({
          id: cirugia.id,
          surgerie_date: cirugia.surgerie_date,
          medical_notes: cirugia.medical_notes,
          state_payment: cirugia.state_payment,
          pet: {
            id: cirugia.pet.id,
            name: cirugia.pet.name,
            species: cirugia.pet.species,
            breed: cirugia.pet.breed,
          },
          veterinarian: {
            id: cirugia.veterinarian.id,
            username: cirugia.veterinarian.username,
            email: cirugia.veterinarian.email,
          },
          pagos: cirugia.pagos.map((pago) => ({
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
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      this.logger.log('🚀 Iniciando creación de procedimiento quirurjico')
      this.logger.log(`📋 Data recibida: ${JSON.stringify(data)}`)
      this.logger.log(`👤 User ID: ${userId}`)

      // ✅ Parse appointment date correctly
      const appointmentDate = dayjs(data.date_appointment)
        .tz('America/Lima')
        .toDate()

      if (isNaN(appointmentDate.getTime())) {
        throw new Error('Fecha de procedimiento quirurjico inválida')
      }

      // 1️⃣ Create appointment
      this.logger.log('💉 Creando procedimiento quirurjico...')
      const cirugia = queryRunner.manager.create(SurgiereEntity, {
        veterinarian_id: data.veterinarian_id,
        pet_id: data.pet_id,
        day: data.day,
        surgerie_date: appointmentDate,
        surgerie_type: data.surgerie_type,
        medical_notes: data.medical_notes,
        outcome: data.outcome,
        state_payment: data.state_payment,
        outside: data.outside,
        user_id: userId,
      })

      const cirujiaSave = await queryRunner.manager.save(
        SurgiereEntity,
        cirugia
      )
      this.logger.log(
        `✅ procedimiento quirurjico guardada con ID: ${cirujiaSave.id}`
      )

      // 2️⃣ Create medical record
      this.logger.log('📋 Creando registro médico...')
      const medicalRecord = queryRunner.manager.create(MedicalRecordEntity, {
        veterinarian_id: data.veterinarian_id,
        pet_id: data.pet_id,
        event_type: 1,
        event_date: appointmentDate.getTime(),
        surgerie_id: cirujiaSave.id,
      })

      await queryRunner.manager.save(MedicalRecordEntity, medicalRecord)
      this.logger.log('✅ Registro médico guardado')

      // 3️⃣ Create payment
      this.logger.log('💰 Creando pago...')
      const pago = queryRunner.manager.create(SurigerePaymentEntity, {
        surgiere_id: cirujiaSave.id,
        monto: data.monto,
        adelanto: data.adelanto,
        metodo_pago: data.metodo_pago,
        estado: 'pendiente',
      })

      await queryRunner.manager.save(SurigerePaymentEntity, pago)
      this.logger.log('✅ Pago guardado')

      // 4️⃣ Create appointment time slots
      this.logger.log(
        `⏰ Guardando ${data.selected_segment_times.length} horarios...`
      )

      for (const segmentTime of data.selected_segment_times) {
        this.logger.log(` → Horario ID: ${segmentTime.segment_time_id}`)

        const horario = queryRunner.manager.create(SurigereSheduleEntity, {
          surgiere_id: cirujiaSave.id,
          veterinarie_schedule_hour_id: segmentTime.segment_time_id,
        })

        await queryRunner.manager.save(SurigereSheduleEntity, horario)
      }

      this.logger.log('✅ Todos los horarios guardados')
      this.logger.log('🎉 Cita creada exitosamente')

      await queryRunner.commitTransaction()

      return {
        statusCode: 200,
        message: 'Cirujia creada exitosamente',
        data: cirujiaSave,
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction()
      this.logger.error(`❌ Error al crear cita: ${error.message}`)
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
