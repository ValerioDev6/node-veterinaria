import { Request, Response } from 'express'
import { PaginationDto } from '../../shared/dtos/pagination.dto'
import { CustomError } from '../../shared/errors/custom-error'
import { VeterinarioService } from './veterinario.service'

export class VeterinarioController {
  constructor(
    private readonly veterinarioService: VeterinarioService = new VeterinarioService()
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }

    return res.status(500).json({ error: 'Internal server error' })
  }

  getConfig = (req: Request, res: Response) => {
    this.veterinarioService
      .config()
      .then((config) => res.status(200).json(config))
      .catch((error) => this.handleError(error, res))
  }

  findAll = (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = '' } = req.query
    const [error, paginationDto] = PaginationDto.create(
      +page,
      +limit,
      search as string
    )
    if (error) return res.status(400).json({ error })

    this.veterinarioService
      .getAllVeterinarians(paginationDto!)
      .then((veterinarios) => res.status(200).json(veterinarios))
      .catch((error) => this.handleError(error, res))
  }

  getById = (req: Request, resp: Response) => {
    const { id } = req.params

    this.veterinarioService
      .veterinarianById(id)
      .then((veterinarian) => resp.json(veterinarian))
      .catch((error) => this.handleError(error, resp))
  }

  create = (req: Request, res: Response) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'NotFount imagen from veterinarian' })
    }
    this.veterinarioService
      .createVeterinarian(req.body, req.file)
      .then((veterinarios) => res.status(201).json(veterinarios))
      .catch((error) => this.handleError(error, res))
  }

  update = (req: Request, res: Response) => {
    const { id } = req.params

    this.veterinarioService
      .updateVeterinarian(id, req.body, req.file)
      .then((veterinarian) => res.json(veterinarian))
      .catch((error) => this.handleError(error, res))
  }

  delete = (req: Request, res: Response) => {
    const { id } = req.params
    this.veterinarioService
      .deleteVeterinario(id)
      .then(() => res.status(204).send())
      .catch((error) => this.handleError(error, res))
  }
}
