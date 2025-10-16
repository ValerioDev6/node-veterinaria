import { NextFunction, Request, Response } from 'express'
import { JWTAdapter } from '../../config/jwt.adapter'
import { getRepositoryFactory } from '../../config/typeorm.repository'
import { UserEntity } from '../../modules/user/entities/user.entity'

// Extender la interfaz Request de Express
declare global {
  namespace Express {
    interface Request {
      user?: UserEntity // ✅ Aquí va el usuario, NO en body
    }
  }
}

export class AuthMiddleware {
  static async validateJWT(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const authorization = req.header('Authorization')

    // Verificar si el token existe
    if (!authorization || !authorization.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Invalid or missing token' })
      return
    }

    // Extraer el token
    const token = authorization.split(' ')[1]

    try {
      // Validar el token
      const payload = await JWTAdapter.validateToken<{ id: string }>(token)
      if (!payload) {
        res.status(401).json({ error: 'Invalid token' })
        return
      }

      // Buscar el usuario en la base de datos
      const userRepository = getRepositoryFactory(UserEntity)
      const user = await userRepository.findOne({
        where: { id: payload.id },
        relations: [
          'roles',
          'roles.role_permissions',
          'roles.role_permissions.permissions',
          'roles.role_permissions.permissions.object',
        ],
      })

      if (!user) {
        res.status(401).json({ error: 'User not found' })
        return
      }

      // ✅ CORRECTO: Adjuntar el usuario a req.user (NO a req.body.user)
      req.user = user
      next()
    } catch (error) {
      res.status(500).json({ error: `Internal server error: ${error}` })
    }
  }
}
