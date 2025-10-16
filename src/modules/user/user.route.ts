import { upload } from '@config/multer.config'
import { type Request, type Response, Router } from 'express'
import { UserController } from './controller/user.controller'
import { UsersService } from './services/user.service'

export class UserRouter {
  static get routes(): Router {
    const router = Router()
    const usersService = new UsersService()
    const controller = new UserController(usersService)
    // const userMiddleware = new UserMiddleware()

    router.get('/', (req, res) => {
      controller.getAllStaff(req, res)
    })

    router.get('/combo', controller.getComboRoles)
    router.get('/:id', (req, res) => controller.getUserById(req, res))
    // router.post('/',[userMiddleware.validateCreateUser], (req: Request, res: Response) => {
    //   controller.createStaff(req, res);
    // });
    router.post('/', upload.single('avatar'), (req: Request, res: Response) => {
      controller.createStaff(req, res)
    })

    // router.patch(
    //   '/:id',
    //   [userMiddleware.validateUpdateUser],
    //   (req: Request, res: Response) => {
    //     controller.updateStaff(req, res)
    //   }
    // )
    router.patch(
      '/:id',
      upload.single('avatar'),
      (req: Request, res: Response) => {
        controller.updateStaff(req, res)
      }
    )

    router.delete('/:id', (req, res) => controller.deleteUser(req, res))

    return router
  }
}
