import { VacunasPaginationDto } from '@modules/vacunas/dto/vacunas.pagination.dto'
import { CustomError } from '@shared/errors'
import { Request, Response } from 'express'
import { PagosService } from './pagos.service'

export class PagosController {
  constructor(
    private readonly pagosService: PagosService = new PagosService()
  ) {}
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }

  create = (req: Request, res: Response) => {
    this.pagosService
      .store(req.body)
      .then((pago) => res.json(pago))
      .catch((error) => this.handleError(error, res))
  }

  getAllVacunas = (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query
      const {
        petName,
        species,
        veterinarianName,
        state_payment,
        dateFrom,
        dateTo,
      } = req.query

      const [error, paginationDto] = VacunasPaginationDto.create(
        Number(page),
        Number(limit),
        petName as string,
        species as string,
        veterinarianName as string,
        state_payment as string,
        dateFrom as string,
        dateTo as string
      )

      if (error) {
        return res.status(400).json({ error })
      }

      this.pagosService
        .getAllPagos(paginationDto!)
        .then((result) => res.status(200).json(result))
        .catch((error) => {
          this.handleError(error, res)
        })
    } catch (error) {
      res.status(500).json({ error: `Error interno: ${error}` })
    }
  }
}
