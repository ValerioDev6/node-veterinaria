import { Router } from 'express';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

export class SeedRouter {
  static get routes(): Router {
    const router = Router();

    const seedService = new SeedService();
    const conroller = new SeedController(seedService);

    /**
     * @swagger
     * /api/seed:
     *   post:
     *     summary: Ejecutar seed de la base de datos
     *     description: Inicializa la base de datos con datos de prueba (usuarios, roles, permisos, etc.)
     *     tags: [Seed]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Seed ejecutado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Seed ejecutado correctamente
     *                 data:
     *                   type: object
     *                   properties:
     *                     usersCreated:
     *                       type: number
     *                       example: 5
     *                     rolesCreated:
     *                       type: number
     *                       example: 3
     *                     permissionsCreated:
     *                       type: number
     *                       example: 15
     *                     patientsCreated:
     *                       type: number
     *                       example: 10
     *       400:
     *         description: Error al ejecutar el seed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Error al ejecutar seed
     *                 details:
     *                   type: string
     *       401:
     *         description: No autorizado - Token inválido o no proporcionado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Token no válido
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Error interno del servidor
     */
    router.post('/', (req, res) => {
      conroller.permissioSeeder(req, res);
    });

    return router;
  }
}
