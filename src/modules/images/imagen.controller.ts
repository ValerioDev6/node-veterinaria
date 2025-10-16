import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Request, Response } from 'express';

export class ImagenController {
  getImage = (req: Request, res: Response) => {
    const { type = '', img = '' } = req.params;

    // Create __dirname equivalent for ES modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const imagePath = path.resolve(__dirname, `../../../uploads/${type}/${img}`);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).send('Imagen not found');
    }
    res.sendFile(imagePath);
  };
}
