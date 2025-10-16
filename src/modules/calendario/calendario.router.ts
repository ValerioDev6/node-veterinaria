import { Router } from 'express'
import { CalendarioController } from './calendario.controller'
import { CalendarioService } from './calendario.service'

export class CalendarioRouter {
  static get routes(): Router {
    const router = Router()
    const calendarioService = new CalendarioService()
    const controller = new CalendarioController(calendarioService)

    router.get('/', controller.getCalendar)

    router.patch('/:id', controller.update)
    return router
  }
}
