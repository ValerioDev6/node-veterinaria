import { AuthMiddleware } from '@shared/middlewares'
import { Request, Response, Router } from 'express'
import { AuthController } from './controller/auth.controller'
import { AuthService } from './services/auth.service'

export class AuthRouter {
  static get routes(): Router {
    const router = Router()
    const authService = new AuthService()
    const authController = new AuthController(authService)
    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Iniciar sesión
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 example: admin@veterinaria.com
     *               password:
     *                 type: string
     *                 example: password123
     *     responses:
     *       200:
     *         description: Login exitoso
     *       401:
     *         description: Credenciales incorrectas
     */
    router.post('/login', authController.loginUser)

    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Registrar nuevo usuario
     *     tags: [Auth]
     *     description: Crea una nueva cuenta de usuario
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *               - name
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: nuevo@veterinaria.com
     *               password:
     *                 type: string
     *                 format: password
     *                 minLength: 6
     *                 example: Password123!
     *               name:
     *                 type: string
     *                 example: María García
     *               phone:
     *                 type: string
     *                 example: +51987654321
     *     responses:
     *       201:
     *         description: Usuario creado exitosamente
     *       400:
     *         description: Datos inválidos o email ya registrado
     */

    router.post('/register', authController.createUser)

    /**
     * @swagger
     * /api/auth/check-auth-status:
     *   get:
     *     summary: Validar token JWT
     *     tags: [Auth]
     *     description: Verifica si el token JWT es válido y devuelve los datos del usuario
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Token válido
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 valid:
     *                   type: boolean
     *                   example: true
     *                 user:
     *                   type: object
     *       401:
     *         description: Token inválido o expirado
     */
    router.get(
      '/check-auth-status',
      [
        AuthMiddleware.validateJWT,
        // RoleMiddleware.checkRole([RoleType.SUPER_ADMIN]),
      ],

      (req: Request, res: Response) => {
        authController.profileUser(req, res)
      }
    )

    //  router.get(
    //   '/check-auth-status',
    //   [
    //     AuthMiddleware.validateJWT,
    //     RoleMiddleware.checkRole([
    //       RoleType.USER,
    //       RoleType.ADMIN,
    //       RoleType.CUSTOMER,
    //     ]),
    //     PermissionMiddleware.checkPermission(
    //       MODULE_OBJECT.USER,
    //       ACTION.READ_USER
    //     ),
    //   ],
    //   (req: Request, res: Response) => {
    //     authController.profileUser(req, res)
    //   }
    // )
    return router
  }
}
