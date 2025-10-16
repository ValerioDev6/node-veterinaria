import { Request, Response, Router } from 'express'
import { KPIController } from './kpi.controller'
import { KPIService } from './kpi.service'

export class KPIRouter {
  static get routes(): Router {
    const router = Router()
    const kpiService = new KPIService()
    const kpiController = new KPIController(kpiService)

    router.get('/veterinarios', (req: Request, res: Response) => {
      kpiController.getKpiVeterinarios(req, res)
    })
    router.get('/', (req: Request, res: Response) => {
      kpiController.getKpiData(req, res)
    })

    return router
  }
}
