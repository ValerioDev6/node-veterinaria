import swaggerJSDoc from 'swagger-jsdoc'
import { envs } from './envs'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Veterinaria - Documentación',
    version: '1.0.0',
    description:
      'Documentación completa de la API REST para el sistema de gestión veterinaria',
    contact: {
      name: 'Equipo de Desarrollo',
      email: 'dev@veterinaria.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${envs.PORT}/v1`,
      description: 'Servidor de Desarrollo',
    },
    {
      url: 'https://api.veterinaria.com',
      description: 'Servidor de Producción',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa tu token JWT en el formato: Bearer {token}',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Mensaje de error',
          },
          statusCode: {
            type: 'number',
            description: 'Código de estado HTTP',
          },
        },
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          page: { type: 'number' },
          limit: { type: 'number' },
          total: { type: 'number' },
          totalPages: { type: 'number' },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: 'Auth', description: 'Endpoints de autenticación' },
    { name: 'Users', description: 'Gestión de usuarios' },
    { name: 'Pacientes', description: 'Gestión de pacientes (mascotas)' },
    { name: 'Citas', description: 'Gestión de citas veterinarias' },
    { name: 'Veterinarios', description: 'Gestión de veterinarios' },
    { name: 'Roles', description: 'Gestión de roles y permisos' },
    { name: 'Images', description: 'Gestión de imágenes' },
    { name: 'Seed', description: 'Inicialización de datos' },
  ],
}

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: [
    './src/modules/**/*.router.ts',
    './src/modules/**/*.route.ts',
    './src/modules/**/*.controller.ts',
    './src/modules/**/dto/*.dto.ts',
    './src/modules/**/entities/*.entity.ts',
  ],
}

export const swaggerSpec = swaggerJSDoc(options)
