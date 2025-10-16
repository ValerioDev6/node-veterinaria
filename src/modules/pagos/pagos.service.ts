import { AppDataSource } from '@config/data-source'
import { getRepositoryFactory } from '@config/typeorm.repository'
import { CitaEntity } from '@modules/citas/entities/citas.entity'
import { MedicalRecordEntity } from '@modules/citas/entities/medical_record.entity'
import { PagoEntity } from '@modules/citas/entities/pago.entity'
import { SurgiereEntity } from '@modules/surgical-procedures/entities/surgiere.entity'
import { SurigerePaymentEntity } from '@modules/surgical-procedures/entities/surgiere_payment.entity'
import { VacunaEntity } from '@modules/vacunas/entities/vacunas.entity'
import { VacunasPagosEntity } from '@modules/vacunas/entities/vacunas_pagos.entity'
import { DataSource, Repository } from 'typeorm'
import { PagosPaginationDto } from './dto/pagos_pagination.dto'

export class PagosService {
  private readonly datasource: DataSource
  private readonly medicalRecordRepository: Repository<MedicalRecordEntity>
  private readonly pagoRepository: Repository<PagoEntity>
  private readonly surgierePaymentRepository: Repository<SurigerePaymentEntity>
  private readonly vacunasPagosRepository: Repository<VacunasPagosEntity>
  private readonly citaRepository: Repository<CitaEntity>
  private readonly surgiereRepository: Repository<SurgiereEntity>
  private readonly vacunaRepository: Repository<VacunaEntity>

  constructor() {
    this.datasource = AppDataSource
    this.medicalRecordRepository = getRepositoryFactory(MedicalRecordEntity)
    this.pagoRepository = getRepositoryFactory(PagoEntity)
    this.surgierePaymentRepository = getRepositoryFactory(SurigerePaymentEntity)
    this.vacunasPagosRepository = getRepositoryFactory(VacunasPagosEntity)
    this.citaRepository = getRepositoryFactory(CitaEntity)
    this.surgiereRepository = getRepositoryFactory(SurgiereEntity)
    this.vacunaRepository = getRepositoryFactory(VacunaEntity)
  }

  async getAllPagos(paginationDto: PagosPaginationDto) {
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
      // Query para PAGOS DE CITAS
      const citaPagosQuery = this.pagoRepository
        .createQueryBuilder('pago')
        .leftJoinAndSelect('pago.cita', 'cita')
        .leftJoinAndSelect('cita.pet', 'pet')
        .leftJoinAndSelect('cita.veterinarian', 'veterinarian')
        .select([
          'pago.id as id',
          'pago.monto as monto',
          'pago.adelanto as adelanto',
          'pago.metodo_pago as metodo_pago',
          'pago.estado as estado',
          'pago.created_at as fecha',
          "'CITA' as tipo",
          'cita.id as servicio_id',
          'pet.id as pet_id',
          'pet.name as pet_name',
          'pet.species as pet_species',
          'pet.breed as pet_breed',
          'veterinarian.id as vet_id',
          'veterinarian.username as vet_username',
          'veterinarian.email as vet_email',
        ])

      if (petName) {
        citaPagosQuery.andWhere('LOWER(pet.name) LIKE LOWER(:petName)', {
          petName: `%${petName}%`,
        })
      }
      if (species) {
        citaPagosQuery.andWhere('LOWER(pet.species) LIKE LOWER(:species)', {
          species: `%${species}%`,
        })
      }
      if (veterinarianName) {
        citaPagosQuery.andWhere(
          'LOWER(veterinarian.username) LIKE LOWER(:veterinarianName)',
          { veterinarianName: `%${veterinarianName}%` }
        )
      }
      if (state_payment) {
        citaPagosQuery.andWhere('LOWER(pago.estado) = LOWER(:state_payment)', {
          state_payment,
        })
      }
      if (dateFrom) {
        citaPagosQuery.andWhere('pago.created_at >= :dateFrom', {
          dateFrom: new Date(dateFrom + 'T00:00:00'),
        })
      }
      if (dateTo) {
        citaPagosQuery.andWhere('pago.created_at <= :dateTo', {
          dateTo: new Date(dateTo + 'T23:59:59'),
        })
      }

      // Query para PAGOS DE VACUNAS
      const vacunaPagosQuery = this.vacunasPagosRepository
        .createQueryBuilder('pago')
        .leftJoinAndSelect('pago.vacuna', 'vacuna')
        .leftJoinAndSelect('vacuna.pet', 'pet')
        .leftJoinAndSelect('vacuna.veterinarian', 'veterinarian')
        .select([
          'pago.id as id',
          'pago.monto as monto',
          'pago.adelanto as adelanto',
          'pago.metodo_pago as metodo_pago',
          'pago.estado as estado',
          'pago.created_at as fecha',
          "'VACUNA' as tipo",
          'vacuna.id as servicio_id',
          'pet.id as pet_id',
          'pet.name as pet_name',
          'pet.species as pet_species',
          'pet.breed as pet_breed',
          'veterinarian.id as vet_id',
          'veterinarian.username as vet_username',
          'veterinarian.email as vet_email',
        ])

      if (petName) {
        vacunaPagosQuery.andWhere('LOWER(pet.name) LIKE LOWER(:petName)', {
          petName: `%${petName}%`,
        })
      }
      if (species) {
        vacunaPagosQuery.andWhere('LOWER(pet.species) LIKE LOWER(:species)', {
          species: `%${species}%`,
        })
      }
      if (veterinarianName) {
        vacunaPagosQuery.andWhere(
          'LOWER(veterinarian.username) LIKE LOWER(:veterinarianName)',
          { veterinarianName: `%${veterinarianName}%` }
        )
      }
      if (state_payment) {
        vacunaPagosQuery.andWhere(
          'LOWER(pago.estado) = LOWER(:state_payment)',
          {
            state_payment,
          }
        )
      }
      if (dateFrom) {
        vacunaPagosQuery.andWhere('pago.created_at >= :dateFrom', {
          dateFrom: new Date(dateFrom + 'T00:00:00'),
        })
      }
      if (dateTo) {
        vacunaPagosQuery.andWhere('pago.created_at <= :dateTo', {
          dateTo: new Date(dateTo + 'T23:59:59'),
        })
      }

      // Query para PAGOS DE CIRUGÍAS
      const surgierePagosQuery = this.surgierePaymentRepository
        .createQueryBuilder('pago')
        .leftJoinAndSelect('pago.surgiere', 'surgiere')
        .leftJoinAndSelect('surgiere.pet', 'pet')
        .leftJoinAndSelect('surgiere.veterinarian', 'veterinarian')
        .select([
          'pago.id as id',
          'pago.monto as monto',
          'pago.adelanto as adelanto',
          'pago.metodo_pago as metodo_pago',
          'pago.estado as estado',
          'pago.created_at as fecha',
          "'CIRUGÍA' as tipo",
          'surgiere.id as servicio_id',
          'pet.id as pet_id',
          'pet.name as pet_name',
          'pet.species as pet_species',
          'pet.breed as pet_breed',
          'veterinarian.id as vet_id',
          'veterinarian.username as vet_username',
          'veterinarian.email as vet_email',
        ])

      if (petName) {
        surgierePagosQuery.andWhere('LOWER(pet.name) LIKE LOWER(:petName)', {
          petName: `%${petName}%`,
        })
      }
      if (species) {
        surgierePagosQuery.andWhere('LOWER(pet.species) LIKE LOWER(:species)', {
          species: `%${species}%`,
        })
      }
      if (veterinarianName) {
        surgierePagosQuery.andWhere(
          'LOWER(veterinarian.username) LIKE LOWER(:veterinarianName)',
          { veterinarianName: `%${veterinarianName}%` }
        )
      }
      if (state_payment) {
        surgierePagosQuery.andWhere(
          'LOWER(pago.estado) = LOWER(:state_payment)',
          {
            state_payment,
          }
        )
      }
      if (dateFrom) {
        surgierePagosQuery.andWhere('pago.created_at >= :dateFrom', {
          dateFrom: new Date(dateFrom + 'T00:00:00'),
        })
      }
      if (dateTo) {
        surgierePagosQuery.andWhere('pago.created_at <= :dateTo', {
          dateTo: new Date(dateTo + 'T23:59:59'),
        })
      }

      // Ejecutar queries
      const citaPagos = await citaPagosQuery.getRawMany()
      const vacunaPagos = await vacunaPagosQuery.getRawMany()
      const surgierePagos = await surgierePagosQuery.getRawMany()

      // Combinar todos los pagos
      const allPagos = [...citaPagos, ...vacunaPagos, ...surgierePagos]

      // Ordenar por fecha descendente
      allPagos.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )

      // Paginación manual
      const total = allPagos.length
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPagos = allPagos.slice(startIndex, endIndex)

      // Construir query params
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
            ? `${process.env.URL_ENV}/pagos?page=${
                page + 1
              }&limit=${limit}${queryParams}`
            : null,
        prev:
          page - 1 > 0
            ? `${process.env.URL_ENV}/pagos?page=${
                page - 1
              }&limit=${limit}${queryParams}`
            : null,
        pagos: paginatedPagos.map((pago) => ({
          id: pago.id,
          tipo: pago.tipo,
          servicio_id: pago.servicio_id,
          monto: Number(pago.monto),
          adelanto: Number(pago.adelanto),
          metodo_pago: pago.metodo_pago,
          estado: pago.estado,
          fecha: pago.fecha,
          pet: {
            id: pago.pet_id,
            name: pago.pet_name,
            species: pago.pet_species,
            breed: pago.pet_breed,
          },
          veterinarian: {
            id: pago.vet_id,
            username: pago.vet_username,
            email: pago.vet_email,
          },
        })),
      }
    } catch (error) {
      throw new Error(`Error al obtener los pagos: ${error}`)
    }
  }

  async store(data: any) {
    const method_payment = data.metodo_pago
    const amount = data.monto

    // CITA MEDICA
    if (data.cita_id) {
      const pagos = await this.pagoRepository.find({
        where: { cita_id: data.cita_id },
      })

      if (pagos.length === 0) {
        throw new Error('No se encontraron pagos para esta cita')
      }

      const monto_total = Number(pagos[0].monto)
      const adelanto_total = pagos.reduce(
        (sum, p) => sum + Number(p.adelanto),
        0
      )

      if (adelanto_total + amount > monto_total) {
        return {
          message: 403,
          message_text: `El monto del pago (${amount}) supera la deuda pendiente (${
            monto_total - adelanto_total
          } PEN)`,
        }
      }

      const nuevo_adelanto = adelanto_total + amount

      if (nuevo_adelanto === monto_total) {
        await this.pagoRepository.update(
          { cita_id: data.cita_id },
          { estado: 'pagado' }
        )
      } else {
        await this.pagoRepository.update(
          { cita_id: data.cita_id },
          { estado: 'parcial' }
        )
      }

      await this.pagoRepository.save({
        cita_id: data.cita_id,
        monto: monto_total,
        adelanto: amount,
        metodo_pago: method_payment,
        estado: nuevo_adelanto === monto_total ? 'pagado' : 'parcial',
      })
    }

    // VACUNA
    if (data.vacuna_id) {
      const pagos = await this.vacunasPagosRepository.find({
        where: { vacuna_id: data.vacuna_id },
      })

      if (pagos.length === 0) {
        throw new Error('No se encontraron pagos para esta vacuna')
      }

      const monto_total = Number(pagos[0].monto)
      const adelanto_total = pagos.reduce(
        (sum, p) => sum + Number(p.adelanto),
        0
      )

      if (adelanto_total + amount > monto_total) {
        return {
          message: 403,
          message_text: `El monto del pago (${amount}) supera la deuda pendiente (${
            monto_total - adelanto_total
          } PEN)`,
        }
      }

      const nuevo_adelanto = adelanto_total + amount

      if (nuevo_adelanto === monto_total) {
        await this.vacunasPagosRepository.update(
          { vacuna_id: data.vacuna_id },
          { estado: 'pagado' }
        )
      } else {
        await this.vacunasPagosRepository.update(
          { vacuna_id: data.vacuna_id },
          { estado: 'parcial' }
        )
      }

      await this.vacunasPagosRepository.save({
        vacuna_id: data.vacuna_id,
        monto: monto_total,
        adelanto: amount,
        metodo_pago: method_payment,
        estado: nuevo_adelanto === monto_total ? 'pagado' : 'parcial',
      })
    }

    // CIRUGIA
    if (data.surgiere_id) {
      const pagos = await this.surgierePaymentRepository.find({
        where: { surgiere_id: data.surgiere_id },
      })

      if (pagos.length === 0) {
        throw new Error('No se encontraron pagos para esta cirugía')
      }

      const monto_total = Number(pagos[0].monto)
      const adelanto_total = pagos.reduce(
        (sum, p) => sum + Number(p.adelanto),
        0
      )

      if (adelanto_total + amount > monto_total) {
        return {
          message: 403,
          message_text: `El monto del pago (${amount}) supera la deuda pendiente (${
            monto_total - adelanto_total
          } PEN)`,
        }
      }

      const nuevo_adelanto = adelanto_total + amount

      if (nuevo_adelanto === monto_total) {
        await this.surgierePaymentRepository.update(
          { surgiere_id: data.surgiere_id },
          { estado: 'pagado' }
        )
      } else {
        await this.surgierePaymentRepository.update(
          { surgiere_id: data.surgiere_id },
          { estado: 'parcial' }
        )
      }

      await this.surgierePaymentRepository.save({
        surgiere_id: data.surgiere_id,
        monto: monto_total,
        adelanto: amount,
        metodo_pago: method_payment,
        estado: nuevo_adelanto === monto_total ? 'pagado' : 'parcial',
      })
    }

    return {
      message: 200,
      message_text: 'Pago registrado exitosamente',
    }
  }
}
