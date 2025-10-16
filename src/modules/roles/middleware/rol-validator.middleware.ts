import { NextFunction, Request, Response } from 'express'
import joi from 'joi'

export class RoleMiddleware {
  // Esquema de validación para la creación de roles
  private static createRolSchema = joi.object({
    name: joi.string().required().messages({
      'string.base': 'El nombre del rol debe ser una cadena de texto',
      'string.empty': 'El nombre del rol no puede estar vacío',
      'any.required': 'El nombre del rol es requerido',
    }),
    permissions: joi
      .array()
      .items(
        joi.string().uuid().messages({
          'string.guid': 'ID de permiso inválido',
        })
      )
      .required()
      .min(1) // Asegura que el arreglo no esté vacío
      .messages({
        'array.base': 'La lista de permisos debe ser un arreglo',
        'any.required': 'La lista de permisos es requerida',
        'array.min': 'La lista de permisos no puede estar vacía',
      }),
  })

  // Esquema de validación para la actualización de roles (opcional)
  private static updateRolSchema = joi.object({
    name: joi.string().optional().messages({
      'string.base': 'El nombre del rol debe ser una cadena de texto',
    }),
    permissions: joi
      .array()
      .items(
        joi.string().uuid().messages({
          'string.guid': 'ID de permiso inválido',
        })
      )
      .optional()
      .messages({
        'array.base': 'La lista de permisos debe ser un arreglo',
      }),
  })

  // Middleware para validar la creación de roles
  validateCreateRol = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { error } = RoleMiddleware.createRolSchema.validate(req.body, {
      abortEarly: false, // Permite recopilar todos los errores, no solo el primero
    })

    if (error) {
      res.status(400).json({
        ok: false,
        errors: error.details.map((err) => err.message),
      })
      return
    }

    next()
  }

  // Middleware para validar la actualización de roles (opcional)
  validateUpdateRol = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { error } = RoleMiddleware.updateRolSchema.validate(req.body, {
      abortEarly: false, // Permite recopilar todos los errores, no solo el primero
    })

    if (error) {
      res.status(400).json({
        ok: false,
        errors: error.details.map((err) => err.message),
      })
      return
    }

    next()
  }
}
