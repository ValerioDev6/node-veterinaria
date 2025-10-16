// import { NextFunction, Request, Response } from 'express';
// import { body, param, validationResult } from 'express-validator';

// export class UserMiddleware {
//   // Middleware para validar la creación de usuarios
//   validateCreateUser(req: Request, res: Response, next: NextFunction) {
//     // Aplicar validaciones
//     Promise.all([
//       body('email').isEmail().withMessage('Email no válido').notEmpty().withMessage('El email es obligatorio').run(req),
//       body('password')
//         .isString()
//         .withMessage('La contraseña debe ser un string')
//         .isLength({ min: 6 })
//         .withMessage('La contraseña debe tener al menos 6 caracteres')
//         .notEmpty()
//         .withMessage('La contraseña es obligatoria')
//         .run(req),
//       body('avatar').optional().isString().withMessage('El avatar debe ser un string').run(req),
//       body('roleId')
//         .isUUID()
//         .withMessage('El roleId debe ser un UUID válido')
//         .notEmpty()
//         .withMessage('El roleId es obligatorio')
//         .run(req),
//     ]).then(() => {
//       // Verificar si hay errores
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           ok: false,
//           errors: errors.array(),
//         });
//       }
//       // Si no hay errores, continuar
//       next();
//     });
//   }

//   // Middleware para validar la actualización de usuarios
//   validateUpdateUser(req: Request, res: Response, next: NextFunction) {
//     // Aplicar validaciones
//     Promise.all([
//       param('id').isUUID().withMessage('ID de usuario inválido').run(req),
//       body('email').optional().isEmail().withMessage('Email no válido').run(req),
//       body('password')
//         .optional()
//         .isString()
//         .withMessage('La contraseña debe ser un string')
//         .isLength({ min: 6 })
//         .withMessage('La contraseña debe tener al menos 6 caracteres')
//         .run(req),
//       body('avatar').optional().isString().withMessage('El avatar debe ser un string').run(req),
//       body('roleId').optional().isUUID().withMessage('El roleId debe ser un UUID válido').run(req),
//     ]).then(() => {
//       // Verificar si hay errores
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           ok: false,
//           errors: errors.array(),
//         });
//       }
//       // Si no hay errores, continuar
//       next();
//     });
//   }
// }import { NextFunction, Request, Response } from 'express';
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export class UserMiddleware {
  // Esquema de validación para la creación de usuarios
  private static createUserSchema = Joi.object({
    username: Joi.string().required().messages({
      'any.required': 'El nombre de usuario es obligatorio',
      'string.empty': 'El nombre de usuario no puede estar vacío',
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'El email es obligatorio',
      'string.email': 'El email no es válido',
      'string.empty': 'El email no puede estar vacío',
    }),
    password: Joi.string().min(6).required().messages({
      'any.required': 'La contraseña es obligatoria',
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.empty': 'La contraseña no puede estar vacía',
    }),
    phone: Joi.string().allow(null, '').optional().messages({
      'string.empty': 'El teléfono no puede estar vacío',
    }),
    type_documento: Joi.string().allow(null, '').optional().messages({
      'string.empty': 'El tipo de documento no puede estar vacío',
    }),
    n_documento: Joi.string().allow(null, '').optional().messages({
      'string.empty': 'El número de documento no puede estar vacío',
    }),
    birthday: Joi.date().required().messages({
      'any.required': 'La fecha de cumpleaños es obligatoria',
      'date.base': 'La fecha de cumpleaños no es válida',
    }),

    roles: Joi.string().uuid().required().messages({
      'any.required': 'El roles es obligatorio',
      'string.uuid': 'El roles debe ser un UUID válido',
    }),
  });

  // Esquema de validación para la actualización de usuarios
  private static updateUserSchema = Joi.object({
    username: Joi.string().optional().messages({
      'string.empty': 'El nombre de usuario no puede estar vacío',
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'El email no es válido',
      'string.empty': 'El email no puede estar vacío',
    }),
    password: Joi.string().min(6).optional().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.empty': 'La contraseña no puede estar vacía',
    }),
    phone: Joi.string().allow(null, '').optional().messages({
      'string.empty': 'El teléfono no puede estar vacío',
    }),
    type_documento: Joi.string().allow(null, '').optional().messages({
      'string.empty': 'El tipo de documento no puede estar vacío',
    }),
    n_documento: Joi.string().allow(null, '').optional().messages({
      'string.empty': 'El número de documento no puede estar vacío',
    }),
    birthday: Joi.date().optional().messages({
      'date.base': 'La fecha de cumpleaños no es válida',
    }),

    roleId: Joi.string().uuid().optional().messages({
      'string.uuid': 'El roleId debe ser un UUID válido',
    }),
  });

  // Middleware para validar la creación de usuarios
  validateCreateUser(req: Request, res: Response, next: NextFunction): void {
    const { error } = UserMiddleware.createUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        ok: false,
        errors: error.details.map((err) => err.message),
      });
      return; // Detener la ejecución aquí
    }
    next(); // Continuar si no hay erroress
  }

  // Middleware para validar la actualización de usuarios
  validateUpdateUser(req: Request, res: Response, next: NextFunction): void {
    const { error } = UserMiddleware.updateUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        ok: false,
        errors: error.details.map((err) => err.message),
      });
      return; // Detener la ejecución aquí
    }
    next(); // Continuar si no hay errores
  }
}
