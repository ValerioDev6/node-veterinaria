import { In, Like, Repository } from 'typeorm'
import { DataSource } from 'typeorm/browser'
import { AppDataSource } from '../../../config/data-source'
import { getRepositoryFactory } from '../../../config/typeorm.repository'
import { PaginationDto } from '../../../shared/dtos/pagination.dto'
import { CustomError } from '../../../shared/errors/custom-error'
import { CreateRolDto } from '../dto/create-rol.dto'
import { UpdateRolDto } from '../dto/update-rol.dto'
import { PermissionEntity } from '../entities/permisos.entity'
import { RolePermissionEntity } from '../entities/role_permissions.entity'
import { RoleEntity } from '../entities/roles.entity'

export class RolService {
  private readonly roleRepository: Repository<RoleEntity>
  private readonly rolePermissionRepository: Repository<RolePermissionEntity>
  private readonly permissionRepository: Repository<PermissionEntity>
  private readonly dataSource: DataSource
  constructor() {
    this.roleRepository = getRepositoryFactory(RoleEntity)
    this.rolePermissionRepository = getRepositoryFactory(RolePermissionEntity)
    this.permissionRepository = getRepositoryFactory(PermissionEntity)
    this.dataSource = AppDataSource
  }

  async create(createRolDto: CreateRolDto) {
    // Iniciamos el queryRunner para la transacción
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Crear el rol
      const newRole = this.roleRepository.create({
        name: createRolDto.name,
      })

      const savedRole = await queryRunner.manager.save(newRole)

      // 2. Si hay permisos, crear las relaciones en la tabla role_permissions
      if (createRolDto.permissions && createRolDto.permissions.length > 0) {
        // Usar findBy con In operator en lugar de findByIds (que está obsoleto)
        const permissions = await this.permissionRepository.findBy({
          id: In(createRolDto.permissions),
        })

        // Verificar que todos los permisos existan
        if (permissions.length !== createRolDto.permissions.length) {
          throw CustomError.badRequest('Algunos permisos no existen')
        }

        // Crear todas las relaciones de una vez
        const rolePermissions = permissions.map((permission) => {
          return this.rolePermissionRepository.create({
            roles: savedRole,
            permissions: permission,
          })
        })

        // Guardar todas las relaciones en una sola operación
        await queryRunner.manager.save(rolePermissions)
      }

      // Confirmar la transacción
      await queryRunner.commitTransaction()

      // Retornar el rol con sus permisos
      return await this.findOneWithRelations(savedRole.id)
    } catch (error: any) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction()

      // Mejorar verificación del error de duplicado
      if (error.code === '23505') {
        // Código para restricción única violada en PostgreSQL
        throw CustomError.badRequest('El nombre del rol ya existe')
      }

      throw CustomError.internalServe(
        `Error al crear el rol: ${error.message || error}`
      )
    } finally {
      // Liberar el queryRunner
      await queryRunner.release()
    }
  }

  async findOneWithRelations(id: string) {
    try {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: [
          'role_permissions',
          'role_permissions.permissions',
          'role_permissions.permissions.object',
        ],
      })

      if (!role) {
        throw CustomError.notFound('Rol no encontrado')
      }

      return role
    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      throw CustomError.internalServe('Error al obtener el rol')
    }
  }

  async findPagination(paginationDto: PaginationDto) {
    const { page, limit, search } = paginationDto
    try {
      const whereCondition = search ? { name: Like(`%${search}%`) } : {}

      const [roles, total] = await this.roleRepository.findAndCount({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        order: { name: 'ASC' },
        relations: [
          'role_permissions',
          'role_permissions.permissions',
          'role_permissions.permissions.object',
        ],
      })

      return {
        page,
        limit,
        total,
        next: `${process.env.URL_ENV}/roles?page=${page + 1}&limit=${limit}${
          search ? `&search=${search}` : ''
        }`,
        prev:
          page - 1 > 0
            ? `${process.env.URL_ENV}/roles?page=${page - 1}&limit=${limit}${
                search ? `&search=${search}` : ''
              }`
            : null,
        roles: roles.map((rol) => ({
          ...rol,
        })),
      }
    } catch (error) {
      throw CustomError.internalServe('Error al obtener roles')
    }
  }

  async find(): Promise<RoleEntity[]> {
    try {
      const roles = await this.roleRepository.find({
        order: { name: 'asc' },
      })

      return roles
    } catch (error) {
      throw CustomError.internalServe('Error al obtener roles')
    }
  }

  async update(id: string, updateRolDto: UpdateRolDto) {
    // Iniciamos el queryRunner para la transacción
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Buscar el rol existente
      const existingRole = await this.roleRepository.findOne({
        where: { id },
        relations: ['role_permissions'], // Cargar las relaciones de permisos existentes
      })

      if (!existingRole) {
        throw CustomError.notFound('Rol no encontrado')
      }

      // 2. Actualizar el nombre del rol (si se proporciona)
      if (updateRolDto.name) {
        existingRole.name = updateRolDto.name
      }

      // Guardar el rol actualizado
      const updatedRole = await queryRunner.manager.save(existingRole)

      // 3. Manejar la actualización de permisos (si se proporcionan)
      if (updateRolDto.permissions) {
        // Eliminar las relaciones de permisos existentes
        await queryRunner.manager.delete(RolePermissionEntity, {
          roles: updatedRole,
        })

        // Buscar los nuevos permisos en la base de datos
        const permissions = await this.permissionRepository.findBy({
          id: In(updateRolDto.permissions),
        })

        // Verificar que todos los permisos existan
        if (permissions.length !== updateRolDto.permissions.length) {
          throw CustomError.badRequest('Algunos permisos no existen')
        }

        // Crear nuevas relaciones de permisos
        const rolePermissions = permissions.map((permission) => {
          return this.rolePermissionRepository.create({
            roles: updatedRole,
            permissions: permission,
          })
        })

        // Guardar las nuevas relaciones de permisos
        await queryRunner.manager.save(rolePermissions)
      }

      // Confirmar la transacción
      await queryRunner.commitTransaction()

      // Retornar el rol actualizado con sus permisos
      return await this.findOneWithRelations(updatedRole.id)
    } catch (error: any) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction()

      // Manejar errores específicos
      if (error.code === '23505') {
        // Código para restricción única violada en PostgreSQL
        throw CustomError.badRequest('El nombre del rol ya existe')
      }

      throw CustomError.internalServe(
        `Error al actualizar el rol: ${error.message || error}`
      )
    } finally {
      // Liberar el queryRunner
      await queryRunner.release()
    }
  }

  async delete(id: string) {
    // Iniciamos el queryRunner para la transacción
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Buscar el rol existente
      const existingRole = await this.roleRepository.findOne({
        where: { id },
        relations: ['role_permissions'], // Cargar las relaciones de permisos existentes
      })

      if (!existingRole) {
        throw CustomError.notFound('Rol no encontrado')
      }

      // 2. Eliminar las relaciones de permisos asociadas al rol
      await queryRunner.manager.delete(RolePermissionEntity, {
        roles: existingRole,
      })

      // 3. Eliminar el rol
      await queryRunner.manager.remove(existingRole)

      // Confirmar la transacción
      await queryRunner.commitTransaction()

      return { message: 'Rol eliminado correctamente' }
    } catch (error: any) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction()

      // Manejar errores específicos
      throw CustomError.internalServe(
        `Error al eliminar el rol: ${error.message || error}`
      )
    } finally {
      // Liberar el queryRunner
      await queryRunner.release()
    }
  }

  async getById(id: string) {
    try {
      // Buscar el rol con sus relaciones de permisos
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: [
          'role_permissions',
          'role_permissions.permissions',
          'role_permissions.permissions.object',
        ],
      })

      if (!role) {
        throw CustomError.notFound('Rol no encontrado')
      }

      return role
    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      throw CustomError.internalServe('Error al obtener el rol')
    }
  }
}
