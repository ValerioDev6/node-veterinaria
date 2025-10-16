import { Request, Response, Router } from 'express'
import { PagosController } from './pagos.controller'
import { PagosService } from './pagos.service'

export class PagosRouter {
  static get routes(): Router {
    const router = Router()
    const service = new PagosService()
    const controller = new PagosController(service)

    router.post('/', controller.create)
    router.get('/', (req: Request, res: Response) => {
      controller.getAllVacunas(req, res)
    })

    return router
  }
}
