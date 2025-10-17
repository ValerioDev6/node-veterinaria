import { AppDataSource } from '@config/data-source'
import { swaggerSpec } from '@config/swagger'
import { Logger } from '@shared/logger/logger'
import { LoggerMiddleware, errorMiddleware } from '@shared/middlewares'
import cors from 'cors'
import express, { Router } from 'express'
import 'reflect-metadata'
import swaggerUi from 'swagger-ui-express'
import { DataSource } from 'typeorm'

interface Options {
  port: number
  routes: Router
}

export class Server {
  private app = express()
  private readonly port: number
  private readonly routes: Router
  private dbConnection?: DataSource
  private logger = new Logger('SERVER')
  private loggerMiddleware = new LoggerMiddleware()

  constructor(options: Options) {
    const { port, routes } = options
    this.port = port
    this.routes = routes
  }

  async start() {
    this.app.use((req, res, next) => this.loggerMiddleware.use(req, res, next))

    // CORS configuration
    this.app.use(
      cors({
        origin: [
          'http://localhost:4200',
          'https://angular-veterinaria.onrender.com',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    )

    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))

    // Database
    await this.connectDB()

    // ========================================
    // SWAGGER DOCUMENTATION
    // ========================================

    // Endpoint para obtener el JSON de Swagger
    this.app.get('/api/docs/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(swaggerSpec)
    })

    // UI de Swagger
    this.app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'API Veterinaria - Documentación',
        customfavIcon: 'https://swagger.io/favicon.ico',
      })
    )

    // ========================================
    // API ROUTES
    // ========================================
    this.app.use(this.routes)
    this.app.use(errorMiddleware)

    // Ruta principal
    this.app.get('/', (req, res) => {
      res.json({
        message: '🐾 API Veterinaria',
        version: '1.0.0',
        documentation: `http://localhost:${this.port}/api/docs`,
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          pacientes: '/api/pacientes',
          citas: '/api/citas',
          veterinarios: '/api/veterinarios',
          roles: '/api/roles',
        },
      })
    })

    this.app.listen(this.port, () => {
      this.logger.success(`Server running on port ${this.port}`)
      this.logger.info(
        `Swagger Documentation: http://localhost:${this.port}/api/docs`
      )
      this.logger.info(
        `Swagger JSON: http://localhost:${this.port}/api/docs/swagger.json`
      )
      this.logger.log('Server is ready to accept connections')
    })
    // this.app.listen(this.port, () => {
    //   console.log(`🚀 Server running on port ${this.port}`)
    //   console.log(
    //     `📚 Swagger Documentation: http://localhost:${this.port}/api/docs`
    //   )
    //   console.log(
    //     `📄 Swagger JSON: http://localhost:${this.port}/api/docs/swagger.json`
    //   )
    // })
  }

  private async connectDB(): Promise<void> {
    try {
      this.logger.log('Initializing database connection...')
      this.dbConnection = await AppDataSource.initialize()
      this.logger.success('Database connected successfully')
    } catch (error) {
      this.logger.error(
        'Database connection failed',
        error instanceof Error ? error.stack : String(error)
      )
      throw new Error('Error initializing database')
    }
  }
}
