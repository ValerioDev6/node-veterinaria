import { CustomError } from '@shared/errors'
import { NextFunction, Request, Response } from 'express'

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // ← Cambiar de Response a void
  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      error: error.message,
    })
    return
  }

  // Otros errores
  res.status(500).json({
    error: 'Error interno del servidor',
  })
}
