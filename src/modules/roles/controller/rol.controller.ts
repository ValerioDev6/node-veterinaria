import { Request, Response } from 'express';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { CustomError } from '../../../shared/errors/custom-error';
import { RolService } from '../services/rol.service';

export class RolController {
  constructor(private readonly rolService: RolService = new RolService()) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  };

  // getRoles = (req: Request, res: Response) => {
  //   this.rolService
  //     .find()
  //     .then((roles) => res.status(201).json(roles))
  //     .catch((error) => this.handleError(error, res));
  // };

  getRoles = (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit, search as string);
    if (error) return res.status(400).json({ error });

    this.rolService
      .findPagination(paginationDto!)
      .then((roles) => res.status(200).json(roles))
      .catch((error) => this.handleError(error, res));
  };

  getRoleById = (req: Request, res: Response) => {
    const { id } = req.params;

    this.rolService
      .getById(id)
      .then((rol) => res.json(rol))
      .catch((error) => this.handleError(error, res));
  };

  createRol = (req: Request, res: Response) => {
    this.rolService
      .create(req.body)
      .then((rol) => res.status(201).json(rol))
      .catch((error) => this.handleError(error, res));
  };

  updateRol = (req: Request, res: Response) => {
    const { id } = req.params;
    this.rolService
      .update(id, req.body)
      .then((rol) => res.json(rol))
      .catch((error) => this.handleError(error, res));
  };

  deleteRol = (req: Request, res: Response) => {
    const { id } = req.params;
    this.rolService
      .delete(id)
      .then((rol) => res.json(rol))
      .catch((error) => this.handleError(error, res));
  };
}
