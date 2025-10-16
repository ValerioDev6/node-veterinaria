import { type Request, type Response } from 'express';
import { CustomError } from '../../shared/errors/custom-error';
import { SeedService } from './seed.service';

export class SeedController {
  constructor(private readonly seedService: SeedService = new SeedService()) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  };

  permissioSeeder = (req: Request, res: Response) => {
    this.seedService
      .seed()
      .then((result) => res.status(200).json(result))
      .catch((error) => this.handleError(error, res));
  };
}
