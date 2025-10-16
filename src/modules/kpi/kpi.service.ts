import { AppDataSource } from '@config/data-source'
import { getRepositoryFactory } from '@config/typeorm.repository'
import { CitaEntity } from '@modules/citas/entities/citas.entity'
import { MedicalRecordEntity } from '@modules/citas/entities/medical_record.entity'
import { PagoEntity } from '@modules/citas/entities/pago.entity'
import { PacienteEntity } from '@modules/pacientes/entities/paciente.entity'
import { SurgiereEntity } from '@modules/surgical-procedures/entities/surgiere.entity'
import { UserEntity } from '@modules/user/entities/user.entity'
import { VacunaEntity } from '@modules/vacunas/entities/vacunas.entity'
import { VacunasPagosEntity } from '@modules/vacunas/entities/vacunas_pagos.entity'
import dayjs from 'dayjs'
import { DataSource, Repository } from 'typeorm'
interface KPIResponse {
  ingresosDia: number
  citasHoy: number
  nuevosPacientes: number
  vacunasMes: number
  ingresosMes: number
  citasMes: number
  cirugiasMes: number
  veterinariosActivos: number
}
export class KPIService {
  private readonly dataSource: DataSource
  private readonly userRepository: Repository<UserEntity>
  private readonly citaRepository: Repository<CitaEntity>
  private readonly cirugiaRepository: Repository<SurgiereEntity>
  private readonly vacunasRepository: Repository<VacunaEntity>
  private readonly pagosRepository: Repository<PagoEntity>
  private readonly vacunasPagosRepository: Repository<VacunasPagosEntity>
  private readonly pacienteRepository: Repository<PacienteEntity>
  private readonly medicalRecordRepository: Repository<MedicalRecordEntity>

  constructor() {
    this.dataSource = AppDataSource
    this.userRepository = getRepositoryFactory(UserEntity)
    this.citaRepository = getRepositoryFactory(CitaEntity)
    this.cirugiaRepository = getRepositoryFactory(SurgiereEntity)
    this.vacunasRepository = getRepositoryFactory(VacunaEntity)
    this.pagosRepository = getRepositoryFactory(PagoEntity)
  }

  async getKPIs(): Promise<KPIResponse> {
    try {
      const startOfDay = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const endOfDay = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')

      const startOfMonth = dayjs()
        .startOf('month')
        .format('YYYY-MM-DD HH:mm:ss')
      const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss')

      // ==========================================
      // INGRESOS DEL DÍA
      // ==========================================
      const ingresosCitasHoy = await this.pagosRepository
        .createQueryBuilder('pago')
        .select('COALESCE(SUM(pago.monto), 0)', 'total')
        .where('pago.created_at >= :startOfDay', { startOfDay })
        .andWhere('pago.created_at <= :endOfDay', { endOfDay })
        .getRawOne()

      const ingresosVacunasHoy = await this.vacunasPagosRepository
        .createQueryBuilder('vacuna_pago')
        .select('COALESCE(SUM(vacuna_pago.monto), 0)', 'total')
        .where('vacuna_pago.created_at >= :startOfDay', { startOfDay })
        .andWhere('vacuna_pago.created_at <= :endOfDay', { endOfDay })
        .getRawOne()

      const ingresosDia =
        Number.parseFloat(ingresosCitasHoy?.total || '0') +
        Number.parseFloat(ingresosVacunasHoy?.total || '0')

      // ==========================================
      // CITAS HOY
      // ==========================================
      const citasHoy = await this.citaRepository
        .createQueryBuilder('cita')
        .where('cita.day_appointment >= :startOfDay', { startOfDay })
        .andWhere('cita.day_appointment <= :endOfDay', { endOfDay })
        .getCount()

      // ==========================================
      // NUEVOS PACIENTES DEL MES
      // ==========================================
      const nuevosPacientes = await this.pacienteRepository
        .createQueryBuilder('paciente')
        .where('paciente.created_at >= :startOfMonth', { startOfMonth })
        .andWhere('paciente.created_at <= :endOfMonth', { endOfMonth })
        .getCount()

      // ==========================================
      // VACUNAS APLICADAS EN EL MES
      // ==========================================
      const vacunasMes = await this.vacunasRepository
        .createQueryBuilder('vacuna')
        .where('vacuna.vaccination_day >= :startOfMonth', { startOfMonth })
        .andWhere('vacuna.vaccination_day <= :endOfMonth', { endOfMonth })
        .getCount()

      // ==========================================
      // INGRESOS DEL MES
      // ==========================================
      const ingresosCitasMes = await this.pagosRepository
        .createQueryBuilder('pago')
        .select('COALESCE(SUM(pago.monto), 0)', 'total')
        .where('pago.created_at >= :startOfMonth', { startOfMonth })
        .andWhere('pago.created_at <= :endOfMonth', { endOfMonth })
        .getRawOne()

      const ingresosVacunasMes = await this.vacunasPagosRepository
        .createQueryBuilder('vacuna_pago')
        .select('COALESCE(SUM(vacuna_pago.monto), 0)', 'total')
        .where('vacuna_pago.created_at >= :startOfMonth', { startOfMonth })
        .andWhere('vacuna_pago.created_at <= :endOfMonth', { endOfMonth })
        .getRawOne()

      const ingresosMes =
        Number.parseFloat(ingresosCitasMes?.total || '0') +
        Number.parseFloat(ingresosVacunasMes?.total || '0')

      // ==========================================
      // CITAS DEL MES
      // ==========================================
      const citasMes = await this.citaRepository
        .createQueryBuilder('cita')
        .where('cita.day_appointment >= :startOfMonth', { startOfMonth })
        .andWhere('cita.day_appointment <= :endOfMonth', { endOfMonth })
        .getCount()

      // ==========================================
      // CIRUGÍAS DEL MES
      // ==========================================
      const cirugiasMes = await this.cirugiaRepository
        .createQueryBuilder('surgiere')
        .where('surgiere.surgerie_date >= :startOfMonth', { startOfMonth })
        .andWhere('surgiere.surgerie_date <= :endOfMonth', { endOfMonth })
        .getCount()

      // ==========================================
      // VETERINARIOS ACTIVOS
      // ==========================================
      const veterinariosActivos = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.roles', 'role')
        .where('role.name = :roleName', { roleName: 'VETERINARIO' })
        .getCount()

      return {
        ingresosDia: Number(ingresosDia.toFixed(2)),
        citasHoy,
        nuevosPacientes,
        vacunasMes,
        ingresosMes: Number(ingresosMes.toFixed(2)),
        citasMes,
        cirugiasMes,
        veterinariosActivos,
      }
    } catch (error) {
      console.error('Error obteniendo KPIs:', error)
      throw new Error('Error al obtener los KPIs')
    }
  }

  async getTotalVeterinarios() {
    try {
      const startOfDay = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const endOfDay = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')

      const startOfMonth = dayjs()
        .startOf('month')
        .format('YYYY-MM-DD HH:mm:ss')
      const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss')

      const totalVeterinarios = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.roles', 'role')
        .where('role.name = :roleName', { roleName: 'VETERINARIO' })
        .getCount()

      const ingresosCitasHoy = await this.pagosRepository
        .createQueryBuilder('pago')
        .select('COALESCE(SUM(pago.monto), 0)', 'total')
        .where('pago.created_at >= :startOfDay', { startOfDay })
        .andWhere('pago.created_at <= :endOfDay', { endOfDay })
        .getRawOne()

      const ingresosVacunasHoy = await this.vacunasPagosRepository
        .createQueryBuilder('vacuna_pago')
        .select('COALESCE(SUM(vacuna_pago.monto), 0)', 'total')
        .where('vacuna_pago.created_at >= :startOfDay', { startOfDay })
        .andWhere('vacuna_pago.created_at <= :endOfDay', { endOfDay })
        .getRawOne()

      const citasMes = await this.citaRepository
        .createQueryBuilder('cita')
        .where('cita.day_appointment >= :startOfMonth', { startOfMonth })
        .andWhere('cita.day_appointment <= :endOfMonth', { endOfMonth })
        .getCount()

      const cirugiasMes = await this.cirugiaRepository
        .createQueryBuilder('surgiere')
        .where('surgiere.surgerie_date >= :startOfMonth', { startOfMonth })
        .andWhere('surgiere.surgerie_date <= :endOfMonth', { endOfMonth })
        .getCount()

      return {
        totalVeterinarios,
        citasMes,
        ingresosCitasHoy,
        ingresosVacunasHoy,
        cirugiasMes,
      }
    } catch (error) {
      throw new Error(`Error al obtener el total de veterinarios: ${error}`)
    }
  }
}
