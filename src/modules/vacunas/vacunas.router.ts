import { AuthMiddleware } from '@shared/middlewares'
import { Request, Response, Router } from 'express'
import { VacunaController } from './vacuna.controller'
import { VacunaService } from './vacunas.service'

export class VacunasRouter {
  static get routes(): Router {
    const router = Router()

    const vacunasService = new VacunaService()
    const controller = new VacunaController(vacunasService)
    router.get('/', (req: Request, res: Response) => {
      controller.getAllVacunas(req, res)
    })
    router.post(
      '/',
      [AuthMiddleware.validateJWT],
      (req: Request, resp: Response) => {
        controller.create(req, resp)
      }
    )
    return router
  }
}
