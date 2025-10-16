import { CustomError } from '@shared/errors'
import { Request, Response } from 'express'
import { CalendarioService } from './calendario.service'

export class CalendarioController {
  constructor(
    private readonly _calendarioService: CalendarioService = new CalendarioService()
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }

  getCalendar = (req: Request, res: Response) => {
    this._calendarioService
      .calendar()
      .then((calendarios) => res.json(calendarios))
      .catch((error) => this.handleError(error, res))
  }

  update = (req: Request, res: Response) => {
    const { id } = req.params
    this._calendarioService
      .update(+id, req.body)
      .then((calendario) => res.json(calendario))
      .catch((error) => this.handleError(error, res))
  }
}
