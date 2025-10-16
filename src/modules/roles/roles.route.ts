import { Request, Response, Router } from 'express'
import { RolController } from './controller/rol.controller'
import { RolService } from './services/rol.service'

export class RolesRouter {
  static get routes(): Router {
    const router = Router()
    const roleService = new RolService()
    const controller = new RolController(roleService)
    // const roleMiddleware = new RoleMiddleware();

    router.get('/', (req: Request, res: Response) => {
      controller.getRoles(req, res)
    })

    router.get('/:id', controller.getRoleById)
    //router.post('/', [roleMiddleware.validateCreateRol], controller.createRol);
    router.post('/', controller.createRol)

    // router.patch('/:id', [roleMiddleware.validateUpdateRol], controller.updateRol);
    router.patch('/:id', controller.updateRol)

    router.delete('/:id', controller.deleteRol)

    return router
  }
}
