import { Request, Response } from 'express'
import { CustomError } from '../../../shared/errors/custom-error'
import { CitaPaginationDto } from '../dto/cita_pagination'
import { CitasService } from '../services/citas.service'

export class CitasController {
  constructor(
    private readonly _citaService: CitasService = new CitasService()
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }

  getAllCitas = (req: Request, res: Response) => {
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

      const [error, paginationDto] = CitaPaginationDto.create(
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

      this._citaService
        .getAllCitas(paginationDto!)
        .then((result) => res.status(200).json(result))
        .catch((error) => {
          this.handleError(error, res)
        })
    } catch (error) {
      res.status(500).json({ error: `Error interno: ${error}` })
    }
  }

  findPaciente = (req: Request, res: Response) => {
    this._citaService
      .getPacientes()
      .then((pacientes) => res.status(200).json(pacientes))
      .catch((error) => this.handleError(error, res))
  }

  // findShedules = (req: Request, res: Response) => {
  //   this._citaService
  //     .getShedules()
  //     .then((shedules) => res.status(200).json(shedules))
  //     .catch((error) => this.handleError(error, res));
  // };

  findVeterinario = (req: Request, res: Response) => {
    this._citaService
      .getVeterinarios()
      .then((veterinarios) => res.status(200).json(veterinarios))
      .catch((error) => this.handleError(error, res))
  }
  create = (req: Request, res: Response) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }
      const cleanData = req.body
      this._citaService
        .store(cleanData, userId)
        .then((cita) => res.status(200).json(cita))
        .catch((error) => {
          console.error('❌ Error en store:', error)
          this.handleError(error, res)
        })
    } catch (error) {
      console.error('❌ Error en create:', error)
      res.status(500).json({ error: 'Error interno' })
    }
  }

  citaGetById = (req: Request, res: Response) => {
    const { id } = req.params
    this._citaService
      .getCitaById(+id)
      .then((cita) => res.json(cita))
      .catch((error) => this.handleError(error, res))
  }

  update = (req: Request, res: Response) => {
    const { id } = req.params
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    const cleanData = req.body

    this._citaService
      .update(+id, cleanData, userId)
      .then((cita) => res.json(cita))
      .catch((error) => this.handleError(error, res))
  }

  delete = (req: Request, res: Response) => {
    const { id } = req.params
    this._citaService
      .delete(+id)
      .then((cita) => res.json(cita))
      .catch((error) => this.handleError(error, res))
  }

  async filter(req: Request, res: Response) {
    try {
      const result = await this._citaService.filter({
        date_appointment: req.query.date_appointment as string,
        hour: req.query.hour as string | undefined,
      })

      return res.json(result)
    } catch (error: any) {
      return res.status(500).json({
        message: 'Error al filtrar veterinarios',
        error: error.message,
      })
    }
  }
}
