import { AuthMiddleware } from '@shared/middlewares'
import { Request, Response, Router } from 'express'
import { SurgicalController } from './surgical.controller'
import { SurgicalService } from './surgical.service'

export class SurgicalRouter {
  static get routes(): Router {
    const router = Router()
    const service = new SurgicalService()
    const controller = new SurgicalController(service)

    router.get('/', (req: Request, res: Response) => {
      controller.getAllVacunas(req, res)
    })

    router.post(
      '/',
      [AuthMiddleware.validateJWT],
      (req: Request, res: Response) => {
        controller.create(req, res)
      }
    )

    return router
  }
}
