import { AuthMiddleware } from '@shared/middlewares'
import { Request, Response, Router } from 'express'
import { CitasController } from './controller/citas.controller'
import { CitasService } from './services/citas.service'

export class CitasRouter {
  static get routes(): Router {
    const router = Router()
    const citaService = new CitasService()
    const controller = new CitasController(citaService)

    router.get('/pacientes', controller.findPaciente)
    router.get('/veterinarios', controller.findVeterinario)

    router.get('/veterinarian-shedules', (req: Request, resp: Response) => {
      controller.filter(req, resp)
    })
    router.get('/:id', controller.citaGetById)

    router.post(
      '/',
      [AuthMiddleware.validateJWT],
      (req: Request, resp: Response) => {
        controller.create(req, resp)
      }
    )
    router.patch(
      '/',
      [AuthMiddleware.validateJWT],
      (req: Request, resp: Response) => {
        controller.update(req, resp)
      }
    )
    router.get('/', (req: Request, res: Response) => {
      controller.getAllCitas(req, res)
    })

    router.delete('/:id', controller.delete)
    return router
  }
}
