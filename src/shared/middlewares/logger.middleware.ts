import { Logger } from '@shared/logger/logger'
import { NextFunction, Request, Response } from 'express'

export class LoggerMiddleware {
  private logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req
    const userAgent = req.get('user-agent') || ''

    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`)

    // Capturar el tiempo de respuesta
    const start = Date.now()

    res.on('finish', () => {
      const { statusCode } = res
      const contentLength = res.get('content-length') || '0'
      const duration = Date.now() - start

      const message = `${method} ${originalUrl} ${statusCode} ${contentLength}bytes - ${duration}ms`

      if (statusCode >= 500) {
        this.logger.error(message)
      } else if (statusCode >= 400) {
        this.logger.warn(message)
      } else {
        this.logger.log(message)
      }
    })

    next()
  }
}
