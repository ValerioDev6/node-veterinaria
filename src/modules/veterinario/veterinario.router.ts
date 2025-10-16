import { upload } from '@config/multer.config'
import { Request, Response, Router } from 'express'
import { VeterinarioController } from './veterinario.controller'
import { VeterinarioService } from './veterinario.service'

export class VeterinarioRouter {
  static get routes(): Router {
    const router = Router()

    const veterinarioService = new VeterinarioService()
    const controller = new VeterinarioController(veterinarioService)

    router.get('/', (req: Request, res: Response) => {
      controller.findAll(req, res)
    })
    router.get('/config', controller.getConfig)
    router.post('/', upload.single('avatar'), (req: Request, res: Response) => {
      controller.create(req, res)
    })
    router.get('/:id', (req, res) => controller.getById(req, res))

    router.patch(
      '/:id',
      upload.single('avatar'),
      (req: Request, res: Response) => {
        controller.update(req, res)
      }
    )

    router.delete('/', controller.delete)
    return router
  }
}
