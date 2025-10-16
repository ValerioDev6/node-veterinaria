import { Router } from 'express';
import { ImagenController } from './imagen.controller';

export class ImagenRouter {
  static get routes(): Router {
    const router = Router();
    const controller = new ImagenController();
    router.get('/:type/:img', (req, res) => {
      controller.getImage(req, res);
    });

    return router;
  }
}
