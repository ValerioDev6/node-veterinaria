import { Request, Response } from 'express'
import { PaginationDto } from '../../../shared/dtos/pagination.dto'
import { CustomError } from '../../../shared/errors/custom-error'
import { PacienteService } from '../services/paciente.services'

export class PacienteController {
  constructor(
    private readonly pacienteService: PacienteService = new PacienteService()
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }

    return res.status(500).json({ error: 'Internal server error' })
  }
  findAll = (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = '' } = req.query
    const [error, paginationDto] = PaginationDto.create(
      +page,
      +limit,
      search as string
    )
    if (error) return res.status(400).json({ error })

    this.pacienteService
      .getAllPatients(paginationDto!)
      .then((veterinarios) => res.status(200).json(veterinarios))
      .catch((error) => this.handleError(error, res))
  }

  getById = (req: Request, res: Response) => {
    const { id } = req.params

    this.pacienteService
      .getPacineteById(+id)
      .then((paciente) => res.json(paciente))
      .catch((error) => this.handleError(error, res))
  }

  create = (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó una imagen' })
    }
    this.pacienteService
      .createPatient(req.body, req.file)
      .then((paciente) => res.json(paciente))
      .catch((error) => this.handleError(error, res))
  }

  update = (req: Request, res: Response) => {
    const { id } = req.params
    this.pacienteService
      .updatePatient(+id, req.body, req.file)
      .then((paciente) => res.json(paciente))
      .catch((error) => this.handleError(error, res))
  }

  delete = (req: Request, res: Response) => {
    const { id } = req.params

    this.pacienteService
      .deletePatient(+id)
      .then((paciente) => res.json(paciente))
      .catch((error) => this.handleError(error, res))
  }
}
