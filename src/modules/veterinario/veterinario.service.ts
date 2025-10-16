import { deleteImageFromCloudinary, uploadImage } from '@config/cloudinary'
import { VeterinarianScheduleDayEntity } from '@modules/user/entities/veterinarian_schedule_days.entity'
import { VeterinarianScheduleHourEntity } from '@modules/user/entities/veterinarian_schedule_hours.entity'
import { VeterinarianScheduleJoinEntity } from '@modules/user/entities/veterinarian_schedule_joins.entity'
import { Logger } from '@shared/logger/logger'
import { formatHour } from '@shared/utils/formattedhours'
import * as fs from 'fs'
import { Like, Repository } from 'typeorm'
import { DataSource } from 'typeorm/browser'
import { bcryptAdapter } from '../../config/bycrypt.adapter'
import { AppDataSource } from '../../config/data-source'
import { getRepositoryFactory } from '../../config/typeorm.repository'
import { PaginationDto } from '../../shared/dtos/pagination.dto'
import { CustomError } from '../../shared/errors/custom-error'
import { FileService } from '../../shared/services/file.service'
import { RoleEntity } from '../roles/entities/roles.entity'
import { UserEntity } from '../user/entities/user.entity'
import {
  CreateVeterinarianDto,
  ScheduleHourItem,
} from './dto/create-veterinario.dto'
import { UpdateVeterinarianDto } from './dto/update-veterinario.dto'

export class VeterinarioService {
  private logger = new Logger('VeterinarioService')
  private readonly userRepository: Repository<UserEntity>
  private readonly roleRepository: Repository<RoleEntity>
  private readonly fileService: FileService
  private readonly veterinarieSchedureHours: Repository<VeterinarianScheduleHourEntity>
  private readonly veterinarianScheduleDayRepository: Repository<VeterinarianScheduleDayEntity>
  private readonly veterinarianScheduleJoinRepository: Repository<VeterinarianScheduleJoinEntity>

  private readonly dataSource: DataSource

  constructor() {
    this.userRepository = getRepositoryFactory(UserEntity)
    this.roleRepository = getRepositoryFactory(RoleEntity)
    this.veterinarieSchedureHours = getRepositoryFactory(
      VeterinarianScheduleHourEntity
    )
    this.veterinarianScheduleDayRepository = getRepositoryFactory(
      VeterinarianScheduleDayEntity
    )
    this.veterinarianScheduleJoinRepository = getRepositoryFactory(
      VeterinarianScheduleJoinEntity
    )
    this.fileService = new FileService()
    this.dataSource = AppDataSource
  }

  async getAllVeterinarians(paginationDto: PaginationDto) {
    const { page, limit, search } = paginationDto
    try {
      const whereCondition = search ? { username: Like(`${search}`) } : {}

      const [veterinarios, total] = await this.userRepository.findAndCount({
        where: {
          ...whereCondition,
          roles: {
            name: 'VETERINARIO',
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        order: { username: 'ASC' },
        relations: {
          roles: true,
        },
      })

      return {
        page,
        limit,
        total,
        next: `${process.env.URL_ENV}/veterinario?page=${
          page + 1
        }&limit=${limit}${search ? `&search=${search}` : ''}`,
        prev:
          page - 1 > 0
            ? `${process.env.URL_ENV}/veterinario?page=${
                page - 1
              }&limit=${limit}${search ? `&search=${search}` : ''}`
            : null,
        veterinarios: veterinarios.map((veterinario) => ({
          ...veterinario,
        })),
      }
    } catch (error) {
      throw CustomError.internalServe(
        `Error al obtener los veterinarios: ${error}`
      )
    }
  }

  async config() {
    const schedule_hours = await this.veterinarieSchedureHours.find()
    const shedule_hours_groups = schedule_hours.map((item) => ({
      id_group: item.id,
      hour: item.hour,
      hour_start: item.hour_start,
      hour_end: item.hour_end,
      hour_start_format: formatHour(item.hour_start),
      hour_end_format: formatHour(item.hour_end),
    }))

    return {
      shedule_hours_groups,
    }
  }

  async createVeterinarian(
    data: CreateVeterinarianDto,
    image: Express.Multer.File
  ): Promise<UserEntity> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Verificar si ya existe un usuario con el mismo email o username
      const existingUser = await this.userRepository.findOne({
        where: [{ email: data.email }, { username: data.username }],
      })

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw CustomError.badRequest('El email ya está registrado')
        }
        if (existingUser.username === data.username) {
          throw CustomError.badRequest('El nombre de usuario ya está en uso')
        }
      }

      // Verificar que el rol existe
      const role = await this.roleRepository.findOne({
        where: { id: data.roleId },
      })

      if (!role) {
        throw CustomError.badRequest(`El rol con ID ${data.roleId} no existe`)
      }

      // Subir imagen de avatar
      let avatarUrl = ''
      let avatarPublicId = ''

      if (image) {
        try {
          const result = await uploadImage(image.path)
          avatarUrl = result.secure_url
          avatarPublicId = result.public_id

          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
        } catch (error) {
          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
          throw CustomError.internalServe(
            `Error al subir la imagen a Cloudinary: ${error}`
          )
        }
      }

      // Hashear contraseña
      const passwordHashed = bcryptAdapter.hash(data.password)

      // Crear veterinario
      const veterinarian = this.userRepository.create({
        username: data.username,
        email: data.email,
        password: passwordHashed,
        phone: data.phone,
        type_documento: data.type_documento,
        n_documento: data.n_documento,
        birthday: data.birthday,
        roles: role,
        avatar: avatarUrl,
        avatar_public_id: avatarPublicId,
      })

      const savedVeterinarian = await queryRunner.manager.save(veterinarian)
      if (data.schedule_hour_veterinarie) {
        const scheduleData: ScheduleHourItem[] = Array.isArray(
          data.schedule_hour_veterinarie
        )
          ? data.schedule_hour_veterinarie
          : JSON.parse(data.schedule_hour_veterinarie || '[]')

        if (scheduleData.length > 0) {
          // Obtener los días únicos
          const uniqueDays = [...new Set(scheduleData.map((item) => item.day))]

          for (const day of uniqueDays) {
            // Crear el registro del día
            const scheduleDay = this.veterinarianScheduleDayRepository.create({
              veterinarian_id: savedVeterinarian.id,
              day,
            })

            const savedScheduleDay = await queryRunner.manager.save(scheduleDay)

            // Filtrar los horarios del día actual
            const dayHours = scheduleData.filter((item) => item.day === day)

            // Crear los joins directamente
            const joins = dayHours.map((hour) => ({
              veterinarian_schedule_day_id: savedScheduleDay.id,
              veterinarian_schedule_hour_id: hour.segment_time_id,
            }))

            // ✅ Guardar los joins con el repositorio correcto
            await queryRunner.manager.save(
              this.veterinarianScheduleJoinRepository.create(joins)
            )
          }
        }
      }

      await queryRunner.commitTransaction()
      return savedVeterinarian
    } catch (error: any) {
      await queryRunner.rollbackTransaction()

      if (!(error instanceof CustomError)) {
        throw CustomError.internalServe(error.message)
      }
      throw error
    } finally {
      await queryRunner.release()
    }
  }
  async veterinarianById(id: string) {
    try {
      // Buscar veterinario con relaciones anidadas
      const veterinarian = await this.userRepository.findOne({
        where: { id },
        relations: {
          roles: true,
          schedule_days: {
            schedule_joins: {
              schedule_hour: true,
            },
          },
        },
      })

      if (!veterinarian) {
        throw CustomError.notFound(`Veterinario con ID ${id} no encontrado`)
      }

      // Verificar que sea veterinario
      if (veterinarian.roles.name !== 'VETERINARIO') {
        throw CustomError.badRequest('El usuario no es un veterinario')
      }

      // Formatear horarios por día
      const formattedSchedule = veterinarian.schedule_days.map((day) => ({
        day: day.day,
        hours: day.schedule_joins
          .map((join) => ({
            id: join.schedule_hour.id,
            hour_start: join.schedule_hour.hour_start,
            hour_end: join.schedule_hour.hour_end,
            hour_group: join.schedule_hour.hour,
          }))
          .sort((a, b) => a.hour_start.localeCompare(b.hour_start)),
      }))

      return {
        id: veterinarian.id,
        username: veterinarian.username,
        email: veterinarian.email,
        phone: veterinarian.phone,
        type_documento: veterinarian.type_documento,
        n_documento: veterinarian.n_documento,
        birthday: veterinarian.birthday,
        avatar: veterinarian.avatar,
        role: veterinarian.roles,
        schedule: formattedSchedule,
      }
    } catch (error: any) {
      this.logger.error(`Error al obtener veterinario: ${error.message}`)
      if (error instanceof CustomError) {
        throw error
      }
      throw CustomError.internalServe(error.message)
    }
  }
  async updateVeterinarian(
    id: string,
    data: UpdateVeterinarianDto,
    image?: Express.Multer.File
  ): Promise<UserEntity> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1️⃣ Verificar que el veterinario existe
      const veterinarian = await this.userRepository.findOne({
        where: { id },
        relations: ['roles', 'schedule_days'],
      })

      if (!veterinarian) {
        throw CustomError.notFound(`El veterinario con ID ${id} no existe`)
      }

      // 2️⃣ Verificar email (solo si cambió)
      if (data.email && data.email !== veterinarian.email) {
        const emailExists = await this.userRepository.findOne({
          where: { email: data.email },
        })
        if (emailExists) {
          throw CustomError.badRequest('El email ya está registrado')
        }
      }

      // 3️⃣ Verificar username (solo si cambió)
      if (data.username && data.username !== veterinarian.username) {
        const usernameExists = await this.userRepository.findOne({
          where: { username: data.username },
        })
        if (usernameExists) {
          throw CustomError.badRequest('El nombre de usuario ya está en uso')
        }
      }

      // 4️⃣ Verificar el rol (solo si se envió uno nuevo)
      if (data.roleId && data.roleId !== veterinarian.roles.id) {
        const foundRole = await this.roleRepository.findOne({
          where: { id: data.roleId },
        })
        if (!foundRole) {
          throw CustomError.badRequest(`El rol con ID ${data.roleId} no existe`)
        }
        veterinarian.roles = foundRole
      }

      // 5️⃣ Subir nueva imagen (solo si se envió)
      if (image) {
        // Eliminar imagen anterior de Cloudinary
        if (veterinarian.avatar_public_id) {
          await deleteImageFromCloudinary(veterinarian.avatar_public_id)
        }

        try {
          const result = await uploadImage(image.path)
          veterinarian.avatar = result.secure_url
          veterinarian.avatar_public_id = result.public_id

          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
        } catch (error) {
          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
          throw CustomError.internalServe(`Error al subir la imagen: ${error}`)
        }
      }

      // 6️⃣ Actualizar campos básicos
      veterinarian.username = data.username || veterinarian.username
      veterinarian.email = data.email || veterinarian.email
      veterinarian.phone = data.phone || veterinarian.phone
      veterinarian.type_documento =
        data.type_documento || veterinarian.type_documento
      veterinarian.n_documento = data.n_documento || veterinarian.n_documento
      if (data.birthday !== undefined) {
        veterinarian.birthday =
          typeof data.birthday === 'string'
            ? new Date(data.birthday)
            : data.birthday
      }
      // 7️⃣ Actualizar contraseña (solo si se envió)
      if (data.password) {
        veterinarian.password = bcryptAdapter.hash(data.password)
      }

      // 8️⃣ Guardar veterinario actualizado
      const updatedVeterinarian = await queryRunner.manager.save(veterinarian)

      // 9️⃣ Actualizar horarios (si se enviaron)
      if (data.schedule_hour_veterinarie) {
        const scheduleData: ScheduleHourItem[] = Array.isArray(
          data.schedule_hour_veterinarie
        )
          ? data.schedule_hour_veterinarie
          : JSON.parse(data.schedule_hour_veterinarie || '[]')

        if (scheduleData.length > 0) {
          // Eliminar horarios anteriores
          await queryRunner.manager.delete(VeterinarianScheduleDayEntity, {
            veterinarian_id: id,
          })

          // Obtener días únicos
          const uniqueDays = [...new Set(scheduleData.map((item) => item.day))]

          for (const day of uniqueDays) {
            // Crear registro del día
            const scheduleDay = this.veterinarianScheduleDayRepository.create({
              veterinarian_id: updatedVeterinarian.id,
              day,
            })

            const savedScheduleDay = await queryRunner.manager.save(scheduleDay)

            // Filtrar horarios del día actual
            const dayHours = scheduleData.filter((item) => item.day === day)

            // Crear los joins
            const joins = dayHours.map((hour) => ({
              veterinarian_schedule_day_id: savedScheduleDay.id,
              veterinarian_schedule_hour_id: hour.segment_time_id,
            }))

            // Guardar joins
            await queryRunner.manager.save(
              this.veterinarianScheduleJoinRepository.create(joins)
            )
          }
        }
      }

      // 🔟 Commit
      await queryRunner.commitTransaction()
      return updatedVeterinarian
    } catch (error: any) {
      await queryRunner.rollbackTransaction()

      if (!(error instanceof CustomError)) {
        throw CustomError.internalServe(error.message)
      }
      throw error
    } finally {
      await queryRunner.release()
    }
  }
  async deleteVeterinario(id: string): Promise<void> {
    // Crear un QueryRunner para manejar la transacción
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Buscar el veterinario con sus relaciones
      const veterinarian = await queryRunner.manager.findOne(UserEntity, {
        where: { id },
        relations: ['schedule_days'],
      })

      // Verificar si existe
      if (!veterinarian) {
        throw CustomError.notFound(`Veterinario con id ${id} no encontrado`)
      }

      // 2. Eliminar avatar de Cloudinary si existe
      if (veterinarian.avatar_public_id) {
        try {
          await deleteImageFromCloudinary(veterinarian.avatar_public_id)
        } catch (error) {
          console.error('Error al eliminar imagen de Cloudinary:', error)
          // No lanzamos error aquí, solo logueamos
        }
      }

      // 3. Eliminar el veterinario
      // El CASCADE automáticamente eliminará:
      // - veterinarian_schedule_days (por onDelete: 'CASCADE')
      // - veterinarian_schedule_joins (por onDelete: 'CASCADE')
      await queryRunner.manager.remove(UserEntity, veterinarian)

      // Confirmar la transacción
      await queryRunner.commitTransaction()
    } catch (error) {
      // Si ocurre un error, revertir los cambios
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // Liberar el queryRunner
      await queryRunner.release()
    }
  }
}
