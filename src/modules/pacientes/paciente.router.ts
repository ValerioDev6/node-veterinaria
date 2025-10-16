import { upload } from '@config/multer.config'
import { Request, Response, Router } from 'express'
import { PacienteController } from './controller/paciente.controller'
import { PacienteService } from './services/paciente.services'

export class PacienteRouter {
  static get routes(): Router {
    const router = Router()
    const pacienteService = new PacienteService()
    const pacienteController = new PacienteController(pacienteService)

    router.get('/', (req: Request, res: Response) => {
      pacienteController.findAll(req, res)
    })

    router.get('/:id', (req: Request, res: Response) => {
      pacienteController.getById(req, res)
    })

    router.post('/', upload.single('photo'), (req: Request, res: Response) => {
      pacienteController.create(req, res)
    })

    router.patch(
      '/:id',
      upload.single('photo'),
      (req: Request, res: Response) => {
        pacienteController.update(req, res)
      }
    )

    router.delete('/:id', (req: Request, res: Response) => {
      pacienteController.delete(req, res)
    })

    return router
  }
}
