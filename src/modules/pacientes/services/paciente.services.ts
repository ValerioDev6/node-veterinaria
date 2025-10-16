import { deleteImageFromCloudinary, uploadImage } from '@config/cloudinary'
import { getRepositoryFactory } from '@config/typeorm.repository'
import { PaginationDto } from '@shared/dtos'
import { Logger } from '@shared/logger/logger'
import * as fs from 'fs'
import { Like, Repository } from 'typeorm'
import { DataSource } from 'typeorm/browser'
import { AppDataSource } from '../../../config/data-source'
import { CustomError } from '../../../shared/errors/custom-error'
import { FileService } from '../../../shared/services/file.service'
import { OwnerEntity } from '../entities/dueno.entity'
import { PacienteEntity } from '../entities/paciente.entity'

export class PacienteService {
  private logger = new Logger('PacienteService')
  private readonly pacienteRepository: Repository<PacienteEntity>
  private readonly ownerRepository: Repository<OwnerEntity>
  private readonly fileService: FileService
  private readonly dataSource: DataSource
  constructor() {
    this.pacienteRepository = getRepositoryFactory(PacienteEntity)
    this.ownerRepository = getRepositoryFactory(OwnerEntity)
    this.fileService = new FileService()
    this.dataSource = AppDataSource
  }

  async getAllPatients(paginationDto: PaginationDto) {
    const { page, limit, search } = paginationDto
    try {
      const whereCondition = search ? { name: Like(`${search}`) } : {}

      const [pacientes, total] = await this.pacienteRepository.findAndCount({
        where: {
          ...whereCondition,
        },
        skip: (page - 1) * limit,
        take: limit,
        order: { name: 'ASC' },
        relations: {
          owner: true,
        },
      })

      return {
        page,
        limit,
        total,
        next: `${process.env.URL_ENV}/api/pacientes?page=${
          page + 1
        }&limit=${limit}${search ? `&search=${search}` : ''}`,
        prev:
          page - 1 > 0
            ? `${process.env.URL_ENV}/api/pacientes?page=${
                page - 1
              }&limit=${limit}${search ? `&search=${search}` : ''}`
            : null,
        pacientes: pacientes.map((paciente) => ({
          ...paciente,
        })),
      }
    } catch (error) {
      throw CustomError.internalServe(
        `Error al obtener los veterinarios: ${error}`
      )
    }
  }

  async getPacineteById(id: number) {
    try {
      const queryBuilder = this.pacienteRepository
        .createQueryBuilder('pacientes')
        .leftJoinAndSelect('pacientes.owner', 'owner')
        .where('pacientes.id = :id', { id })

      const pacienteWithOwner = await queryBuilder.getOne()
      if (!pacienteWithOwner) {
        throw CustomError.notFound('Paciente does not exists')
      }
      return pacienteWithOwner
    } catch (error) {
      throw CustomError.internalServe(`Internal server error: ${error}`)
    }
  }

  async createPatient(data: any, image?: Express.Multer.File) {
    this.logger.log('🚀 === INICIO createPatient ===')
    this.logger.log(`📦 Data: ${JSON.stringify(data, null, 2)}`)

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // ========== 1. CREAR OWNER ==========
      this.logger.log('👤 Paso 1: Creando owner...')

      const ownerData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        type_documento: data.type_documento,
        n_documento: data.n_documento,
      }

      this.logger.log(`📝 Owner data: ${JSON.stringify(ownerData, null, 2)}`)
      const newOwner = this.ownerRepository.create(ownerData)
      const savedOwner = await queryRunner.manager.save(newOwner)
      this.logger.log(`✅ Owner creado con ID: ${savedOwner.id}`)

      // ========== 2. SUBIR IMAGEN ==========
      let photoUrl = null
      let photoPublicId = null

      if (image) {
        this.logger.log('📤 Paso 2: Subiendo imagen...')
        try {
          const result = await uploadImage(image.path)
          photoUrl = result.secure_url
          photoPublicId = result.public_id
          this.logger.log(`✅ Imagen subida: ${photoUrl}`)

          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
        } catch (error) {
          this.logger.error(`❌ Error subiendo imagen: ${error}`)
          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
          this.logger.warn('⚠️ Continuando sin imagen')
        }
      }

      // ========== 3. CREAR PATIENT ==========
      this.logger.log('🐕 Paso 3: Creando patient...')

      const patientData = {
        name: data.name,
        species: data.species,
        breed: data.breed,
        birth_date: data.birth_date,
        gender: data.gender,
        color: data.color,
        weight: data.weight,
        medical_notes: data.medical_notes,
        owner_id: savedOwner.id,
        photo: photoUrl ?? undefined,
        photo_public_id: photoPublicId ?? undefined,
      }

      this.logger.log(
        `📝 Patient data: ${JSON.stringify(patientData, null, 2)}`
      )
      const newPatient = this.pacienteRepository.create(patientData)
      const savedPatient = await queryRunner.manager.save(newPatient)
      this.logger.log(`✅ Patient creado con ID: ${savedPatient}`)

      // ========== 4. COMMIT ==========
      await queryRunner.commitTransaction()
      this.logger.log('✅ Transacción confirmada exitosamente')

      return {
        owner: savedOwner,
        patient: savedPatient,
      }
    } catch (error: any) {
      this.logger.error('❌ ERROR EN createPatient:')
      this.logger.error('Mensaje:', error.message)
      this.logger.error('Stack:', error.stack)

      await queryRunner.rollbackTransaction()
      this.logger.warn('⏪ Transacción revertida')

      throw CustomError.internalServe(
        // ✅ También corregí esto
        `Error al crear paciente: ${error.message}`
      )
    } finally {
      await queryRunner.release()
      this.logger.log('🔓 QueryRunner liberado')
      this.logger.log('🏁 === FIN createPatient ===\n')
    }
  }

  async updatePatient(id: number, data: any, image?: Express.Multer.File) {
    this.logger.log('🚀 === INICIO updatePatient ===')
    this.logger.log(`📦 Patient ID: ${id}`)
    this.logger.log(`📦 Data: ${JSON.stringify(data, null, 2)}`)

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // ========== 1. BUSCAR PACIENTE ==========
      this.logger.log('🔍 Paso 1: Buscando paciente...')
      const patient = await this.pacienteRepository.findOne({
        where: { id },
        relations: ['owner'],
      })

      if (!patient) {
        throw CustomError.notFound(`Paciente con ID ${id} no encontrado`)
      }
      this.logger.log(`✅ Paciente encontrado: ${patient.name}`)

      // ========== 2. BUSCAR Y ACTUALIZAR OWNER ==========
      this.logger.log('👤 Paso 2: Actualizando owner...')
      const owner = await this.ownerRepository.findOne({
        where: { id: patient.owner_id },
      })

      if (!owner) {
        throw CustomError.notFound(
          `Owner con ID ${patient.owner_id} no encontrado`
        )
      }

      // Actualizar datos del owner
      if (data.first_name) owner.first_name = data.first_name
      if (data.last_name) owner.last_name = data.last_name
      if (data.email) owner.email = data.email
      if (data.phone) owner.phone = data.phone
      if (data.address) owner.address = data.address
      if (data.city) owner.city = data.city
      if (data.type_documento) owner.type_documento = data.type_documento
      if (data.n_documento) owner.n_documento = data.n_documento

      const updatedOwner = await queryRunner.manager.save(owner)
      this.logger.log(`✅ Owner actualizado: ${updatedOwner.id}`)

      // ========== 3. ACTUALIZAR IMAGEN SI VIENE ==========
      if (image) {
        this.logger.log('📤 Paso 3: Actualizando imagen...')

        // Eliminar imagen anterior si existe
        if (patient.photo_public_id) {
          try {
            await deleteImageFromCloudinary(patient.photo_public_id)
            this.logger.log('✅ Imagen anterior eliminada')
          } catch (error) {
            this.logger.warn(`⚠️ No se pudo eliminar imagen anterior: ${error}`)
          }
        }

        // Subir nueva imagen
        try {
          const result = await uploadImage(image.path)
          patient.photo = result.secure_url
          patient.photo_public_id = result.public_id
          this.logger.log(`✅ Nueva imagen subida: ${result.secure_url}`)

          // Eliminar archivo temporal
          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
        } catch (error) {
          this.logger.error(`❌ Error subiendo imagen: ${error}`)
          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
          throw CustomError.internalServe(`Error al subir la imagen: ${error}`)
        }
      }

      // ========== 4. ACTUALIZAR PATIENT ==========
      this.logger.log('🐕 Paso 4: Actualizando datos del paciente...')

      if (data.name) patient.name = data.name
      if (data.species) patient.species = data.species
      if (data.breed) patient.breed = data.breed
      if (data.birth_date) patient.birth_date = new Date(data.birth_date)
      if (data.gender) patient.gender = data.gender
      if (data.color !== undefined) patient.color = data.color
      if (data.weight) patient.weight = Number(data.weight)
      if (data.medical_notes !== undefined)
        patient.medical_notes = data.medical_notes

      const updatedPatient = await queryRunner.manager.save(patient)
      this.logger.log(`✅ Patient actualizado: ${updatedPatient.id}`)

      // ========== 5. COMMIT ==========
      await queryRunner.commitTransaction()
      this.logger.log('✅ Transacción confirmada exitosamente')

      return {
        success: true,
        message: 'Paciente actualizado exitosamente',
        data: {
          patient: updatedPatient,
          owner: updatedOwner,
        },
      }
    } catch (error: any) {
      this.logger.error('❌ ERROR EN updatePatient:')
      this.logger.error('Mensaje:', error.message)
      this.logger.error('Stack:', error.stack)

      await queryRunner.rollbackTransaction()
      this.logger.warn('⏪ Transacción revertida')

      if (!(error instanceof CustomError)) {
        throw CustomError.internalServe(
          `Error al actualizar paciente: ${error.message}`
        )
      }
      throw error
    } finally {
      await queryRunner.release()
      this.logger.log('🔓 QueryRunner liberado')
      this.logger.log('🏁 === FIN updatePatient ===\n')
    }
  }

  async deletePatient(patientId: number) {
    this.logger.log('🗑️ === INICIO deletePatient ===')
    this.logger.log(`🆔 Patient ID: ${patientId}`)

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // ========== 1. BUSCAR PACIENTE ==========
      this.logger.log('🔍 Buscando paciente...')

      const patient = await this.pacienteRepository.findOne({
        where: { id: patientId },
      })

      if (!patient) {
        throw CustomError.notFound(`Paciente con ID ${patientId} no encontrado`)
      }

      this.logger.log(`✅ Paciente encontrado: ${patient.name}`)

      // ========== 2. ELIMINAR IMAGEN DE CLOUDINARY ==========
      if (patient.photo_public_id) {
        this.logger.log(`🖼️ Eliminando imagen: ${patient.photo_public_id}`)
        try {
          await deleteImageFromCloudinary(patient.photo_public_id)
          this.logger.log('✅ Imagen eliminada de Cloudinary')
        } catch (error) {
          this.logger.warn(`⚠️ No se pudo eliminar imagen: ${error}`)
          // Continuar aunque falle la eliminación de imagen
        }
      }

      // ========== 3. ELIMINAR PACIENTE ==========
      this.logger.log('🗑️ Eliminando paciente de la BD...')
      await queryRunner.manager.remove(patient)
      this.logger.log('✅ Paciente eliminado')

      // ========== 4. COMMIT ==========
      await queryRunner.commitTransaction()
      this.logger.log('✅ Transacción confirmada')

      return {
        success: true,
        message: 'Paciente eliminado exitosamente',
      }
    } catch (error: any) {
      this.logger.error('❌ ERROR EN deletePatient:')
      this.logger.error('Mensaje:', error.message)

      await queryRunner.rollbackTransaction()
      this.logger.warn('⏪ Transacción revertida')

      if (!(error instanceof CustomError)) {
        throw CustomError.internalServe(
          `Error al eliminar paciente: ${error.message}`
        )
      }
      throw error
    } finally {
      await queryRunner.release()
      this.logger.log('🏁 === FIN deletePatient ===\n')
    }
  }
}
