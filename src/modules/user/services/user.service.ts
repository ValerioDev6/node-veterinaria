import { deleteImageFromCloudinary, uploadImage } from '@config/cloudinary'
import { UploadedFile } from 'express-fileupload'
import * as fs from 'fs'
import { Like, Repository } from 'typeorm'
import { bcryptAdapter } from '../../../config/bycrypt.adapter'
import { getRepositoryFactory } from '../../../config/typeorm.repository'
import { PaginationDto } from '../../../shared/dtos/pagination.dto'
import { CustomError } from '../../../shared/errors/custom-error'
import { FileService } from '../../../shared/services/file.service'
import { RoleEntity } from '../../roles/entities/roles.entity'
import { CreateStaffDto } from '../dto/create-staff.dto'
import { UpdateStaffDto } from '../dto/update-staff.dto'
import { UserEntity } from '../entities/user.entity'

export class UsersService {
  private readonly userRepository: Repository<UserEntity>
  private readonly roleRepository: Repository<RoleEntity>
  private readonly fileService: FileService

  constructor() {
    this.userRepository = getRepositoryFactory(UserEntity)
    this.roleRepository = getRepositoryFactory(RoleEntity)
    this.fileService = new FileService()
  }

  async createStaffV2(
    data: CreateStaffDto,
    image: Express.Multer.File
  ): Promise<UserEntity> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: [{ email: data.email }, { username: data.username }],
      })

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw CustomError.forbidden('El email ya está registrado')
        }
        if (existingUser.username === data.username) {
          throw CustomError.forbidden('El nombre de usuario ya está en uso')
        }
      }

      const role = await this.roleRepository.findOne({
        where: { id: data.roleId },
      })

      if (!role) {
        throw CustomError.badRequest(`El rol con ID ${data.roleId} no existe`)
      }
      // Subir la imagen a Cloudinary
      let avatarUrl = ''
      let avatarPublicId = ''

      if (image) {
        try {
          const result = await uploadImage(image.path)

          avatarUrl = result.secure_url
          avatarPublicId = result.public_id
          // Eliminar archivo temporal
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

      // Hashear la contraseña
      const passwordHashed = bcryptAdapter.hash(data.password)

      // Crear el usuario
      const staff = this.userRepository.create({
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

      const savedStaff = await this.userRepository.save(staff)
      console.log('Usuario creado exitosamente:', savedStaff)
      return savedStaff
    } catch (error: any) {
      if (!(error instanceof CustomError)) {
        throw CustomError.internalServe(error.message)
      }
      throw error
    }
  }
  async createStaff(
    data: CreateStaffDto,
    image: UploadedFile
  ): Promise<UserEntity> {
    try {
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

      const role = await this.roleRepository.findOne({
        where: { id: data.roleId },
      })

      if (!role) {
        throw CustomError.badRequest(`El rol con ID ${data.roleId} no existe`)
      }

      const { fileUrl } = await this.fileService.uploadSingle(
        image,
        'uploads/staff'
      )
      const passwordHashed = bcryptAdapter.hash(data.password)

      const staff = this.userRepository.create({
        username: data.username,
        email: data.email,
        password: passwordHashed,
        phone: data.phone,
        type_documento: data.type_documento,
        n_documento: data.n_documento,
        birthday: data.birthday,
        roles: role,
        avatar: fileUrl,
      })

      const savedStaff = await this.userRepository.save(staff)
      console.log('Usuario creado exitosamente:', savedStaff)

      return savedStaff
    } catch (error: any) {
      if (!(error instanceof CustomError)) {
        throw CustomError.internalServe(error.message)
      }
      throw error
    }
  }

  async findRolCombo(): Promise<RoleEntity[]> {
    try {
      const roles = await this.roleRepository.find({
        select: {
          id: true,
          name: true,
        },
      })
      return roles
    } catch (error) {
      throw CustomError.internalServe(`Error al obtener los roles: ${error}`)
    }
  }

  async find(): Promise<UserEntity[]> {
    try {
      const users = await this.userRepository.find({
        order: { email: 'ASC' },
      })
      return users
    } catch (error) {
      throw CustomError.internalServe('Error al obtener usuarios')
    }
  }

  async findPagination(paginationDto: PaginationDto) {
    const { page, limit, search } = paginationDto
    try {
      const whereCondition = search ? { username: Like(`${search}`) } : {}

      // Usar QueryBuilder para poder aplicar la condición NOT
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .where(whereCondition)
        .andWhere('roles.name != :roleName', { roleName: 'VETERINARIO' })
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('user.username', 'ASC')

      const [users, total] = await queryBuilder.getManyAndCount()

      return {
        info: {
          page,
          limit,
          total,
          next: `${process.env.URL_ENV}/staff?page=${page + 1}&limit=${limit}${
            search ? `&search=${search}` : ''
          }`,
          prev:
            page - 1 > 0
              ? `${process.env.URL_ENV}/staff?page=${page - 1}&limit=${limit}${
                  search ? `&search=${search}` : ''
                }`
              : null,
        },
        users: users.map((user) => ({
          ...user,
        })),
      }
    } catch (error) {
      throw CustomError.internalServe(`Error al obtener usuarios: ${error}`)
    }
  }

  async updateStaffV2(
    id: string,
    data: UpdateStaffDto,
    image?: Express.Multer.File
  ): Promise<UserEntity> {
    try {
      const staff = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
      })

      if (!staff) {
        throw CustomError.notFound(`Staff not found with id: ${id}`)
      }

      // Si hay nueva imagen
      if (image) {
        // 1. Eliminar imagen antigua de Cloudinary (si existe)
        if (staff.avatar_public_id) {
          try {
            await deleteImageFromCloudinary(staff.avatar_public_id) // ✅ Usa tu función
          } catch (error) {
            throw CustomError.notFound(`Error elimianndo avatar : ${error}`)
            // Continuar aunque falle
          }
        }

        // 2. Subir nueva imagen
        try {
          const result = await uploadImage(image.path)

          staff.avatar = result.secure_url
          staff.avatar_public_id = result.public_id
          // Eliminar archivo temporal
          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
        } catch (error) {
          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
          throw CustomError.internalServe(
            `Error al subir la nueva imagen, : ${error}`
          )
        }
      }

      // Actualizar campos
      if (data.username !== undefined) staff.username = data.username
      if (data.email !== undefined) staff.email = data.email
      if (data.phone !== undefined) staff.phone = data.phone
      if (data.type_documento !== undefined)
        staff.type_documento = data.type_documento
      if (data.n_documento !== undefined) staff.n_documento = data.n_documento
      if (data.birthday !== undefined) {
        staff.birthday =
          typeof data.birthday === 'string'
            ? new Date(data.birthday)
            : data.birthday
      }
      if (data.email_verified_at !== undefined) {
        staff.email_verified_at = data.email_verified_at
      }

      // Actualizar rol
      if (data.roleId !== undefined) {
        const role = await this.roleRepository.findOne({
          where: { id: data.roleId },
        })

        if (!role) {
          throw CustomError.badRequest(`El rol con ID ${data.roleId} no existe`)
        }

        staff.roles = role
      }

      await this.userRepository.save(staff)
      console.log('✅ Staff actualizado exitosamente')

      return staff
    } catch (error) {
      console.error('❌ Error updating staff:', error)
      if (!(error instanceof CustomError)) {
        throw CustomError.internalServe('Error al actualizar el perfil')
      }
      throw error
    }
  }

  async updateStaff(
    id: string,
    data: UpdateStaffDto,
    image?: UploadedFile
  ): Promise<UserEntity> {
    try {
      const staff = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
      })
      if (!staff) {
        throw CustomError.notFound(`Staff not found with id: ${id}`)
      }

      if (image) {
        if (staff.avatar) {
          await this.fileService.deleteFileFromUrl(staff.avatar)
        }

        // Upload new image
        console.log('Uploading new image...')
        const { fileUrl } = await this.fileService.uploadSingle(
          image,
          'uploads/staff'
        )
        console.log('New image uploaded:', fileUrl)
        staff.avatar = fileUrl
      }

      // Update all possible fields
      if (data.username !== undefined) staff.username = data.username
      if (data.email !== undefined) staff.email = data.email

      if (data.phone !== undefined) staff.phone = data.phone
      if (data.type_documento !== undefined)
        staff.type_documento = data.type_documento
      if (data.n_documento !== undefined) staff.n_documento = data.n_documento
      if (data.birthday !== undefined) {
        staff.birthday =
          typeof data.birthday === 'string'
            ? new Date(data.birthday)
            : data.birthday
      }
      if (data.email_verified_at !== undefined)
        staff.email_verified_at = data.email_verified_at

      // Update role relationship if roleId is provided
      if (data.roleId !== undefined) {
        // Obtener el rol completo del repositorio
        const role = await this.roleRepository.findOne({
          where: { id: data.roleId },
        })

        if (!role) {
          throw CustomError.badRequest(`El rol con ID ${data.roleId} no existe`)
        }

        staff.roles = role
      }

      console.log('Saving updated staff')
      await this.userRepository.save(staff)
      console.log('Staff successfully updated')
      return staff
    } catch (error) {
      console.error('Error updating staff:', error)
      throw new CustomError(500, 'Error updating profile')
    }
  }

  async findOne(id: string): Promise<UserEntity> {
    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'role')
        .where('user.id = :id', { id })

      const userWithRole = await queryBuilder.getOne()

      if (!userWithRole) {
        throw CustomError.notFound('User does not exist')
      }

      return userWithRole
    } catch (error) {
      throw CustomError.internalServe(`Internal server error: ${error}`)
    }
  }

  async deleteProfile(id: string): Promise<void> {
    try {
      // Buscar el usuario para obtener la ruta de su imagen
      const user = await this.userRepository.findOne({ where: { id } })

      if (!user) {
        throw CustomError.notFound(`Usuario no encontrado con id: ${id}`)
      }

      // Eliminar la imagen del usuario si existe
      if (user.avatar) {
        console.log('Intentando eliminar imagen del usuario:', user.avatar)
        await this.fileService.deleteFileFromUrl(user.avatar)
      }

      // Eliminar el usuario de la base de datos
      console.log('Eliminando usuario con id:', id)
      await this.userRepository.delete(id)
      console.log('Usuario eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      throw new CustomError(500, 'Error al eliminar el perfil de usuario')
    }
  }
}
