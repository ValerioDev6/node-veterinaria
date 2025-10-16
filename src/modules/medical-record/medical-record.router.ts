import { Request, Response, Router } from 'express'
import { MedicalController } from './medical.controller'
import { MedicalRecordService } from './medical.service'

export class MedicalRecordRouter {
  static get routes(): Router {
    const router = Router()
    const service = new MedicalRecordService()
    const controller = new MedicalController(service)

    router.get('/', (req: Request, res: Response) => {
      controller.getMedicalHistory(req, res)
    })

    return router
  }
}
