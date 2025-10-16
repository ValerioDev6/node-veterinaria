import { getRepositoryFactory } from '@config/typeorm.repository'
import { ObjectEntity } from '@modules/roles/entities/object.entity'
import { PermissionEntity } from '@modules/roles/entities/permisos.entity'
import { RolePermissionEntity } from '@modules/roles/entities/role_permissions.entity'
import { RoleType } from '@shared/enums'
import { NextFunction, Request, Response } from 'express'

export class PermissionMiddleware {
  static checkPermission = (objectName: string, action: string) => {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const user = req.body.user
        if (!user || !user.roles) {
          res.status(401).json({ error: 'No user or role found in request' })
          return
        }

        const roleId = user.roles.id
        const roleName = user.roles.name

        if (roleName === RoleType.SUPER_ADMIN || roleName === 'SUPER_ADMIN') {
          next()
          return
        }

        // Para otros roles, verificar permisos normalmente
        const objectRepository = getRepositoryFactory(ObjectEntity)
        const object = await objectRepository.findOne({
          where: { name: objectName },
        })

        if (!object) {
          res.status(404).json({ error: `Object "${objectName}" not found` })
          return
        }

        const permissionRepository = getRepositoryFactory(PermissionEntity)
        const permission = await permissionRepository.findOne({
          where: { action: action, object: { id: object.id } },
          relations: ['object'],
        })

        if (!permission) {
          res.status(403).json({
            error: `Permission ${action} on ${objectName} does not exist`,
          })
          return
        }

        const rolePermissionRepository =
          getRepositoryFactory(RolePermissionEntity)
        const rolePermission = await rolePermissionRepository.findOne({
          where: {
            roles: { id: roleId },
            permissions: { id: permission.id },
          },
        })

        if (!rolePermission) {
          res.status(403).json({
            error: `User does not have permission to ${action} on ${objectName}`,
          })
          return
        }

        next()
      } catch (error) {
        console.error('Permission middleware error:', error)
        res
          .status(500)
          .json({ error: 'Internal server error checking permission' })
        return
      }
    }
  }
}
