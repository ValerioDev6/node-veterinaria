import type { Request, Response } from 'express'
import { PaginationDto } from '../../../shared/dtos/pagination.dto'
import { CustomError } from '../../../shared/errors/custom-error'
import { UsersService } from '../services/user.service'
export class UserController {
  constructor(
    private readonly userService: UsersService = new UsersService()
  ) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }

    return res.status(500).json({ error: 'Internal server error' })
  }

  getAllStaff = (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = '' } = req.query
    const [error, paginationDto] = PaginationDto.create(
      +page,
      +limit,
      search as string
    )
    if (error) return res.status(400).json({ error })

    this.userService
      .findPagination(paginationDto!)
      .then((roles) => res.status(200).json(roles))
      .catch((error) => this.handleError(error, res))
  }

  getComboRoles = (req: Request, res: Response) => {
    this.userService
      .findRolCombo()
      .then((roles) => res.status(200).json(roles))
      .catch((error) => this.handleError(error, res))
  }

  createStaff = (req: Request, res: Response) => {
    // Validar que se haya subido la imagen
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó una imagen' })
    }
    // Llamar al servicio pasando req.file (Multer)
    this.userService
      .createStaffV2(req.body, req.file)
      .then((staff) => res.status(201).json(staff))
      .catch((error) => this.handleError(error, res))
  }
  updateStaff = (req: Request, res: Response) => {
    const { id } = req.params

    this.userService
      .updateStaffV2(id, req.body, req.file) // ← req.file (Multer)
      .then((staff) => res.json(staff))
      .catch((error) => this.handleError(error, res))
  }
  getUserById = (req: Request, res: Response) => {
    const { id } = req.params

    this.userService
      .findOne(id)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res))
  }

  deleteUser = (req: Request, res: Response) => {
    const { id } = req.params

    this.userService
      .deleteProfile(id)
      .then(() => res.status(204).send())
      .catch((error) => this.handleError(error, res))
  }
}
