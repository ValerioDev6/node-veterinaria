import { NextFunction, Request, Response } from 'express';
import { RoleType } from '../enums/rol.enum';

export class RoleMiddleware {
  static checkRole = (allowedRoles: RoleType[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.body.user;
        if (!user) {
          res.status(401).json({ error: 'No user found in request' });
          return;
        }

        // Verificamos si el rol del usuario existe y está en la lista de roles permitidos
        if (!user.roles || !allowedRoles.includes(user.roles.name)) {
          res.status(403).json({
            error: `User role ${user.roles?.name || 'unknown'} is not authorized to access this resource. Allowed roles: ${allowedRoles.join(', ')}`,
          });
          return;
        }

        next();
      } catch  {
        res.status(500).json({ error: 'Internal server error checking role' });
        return;
      }
    };
  };
}
