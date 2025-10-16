import winston from 'winston'
import { winstonConfig } from './logger.config'

export class Logger {
  private logger: winston.Logger
  private context: string

  constructor(context: string) {
    this.context = context
    this.logger = winston.createLogger(winstonConfig)
  }

  log(message: string) {
    this.logger.info(message, { context: this.context })
  }

  error(message: string, trace?: string) {
    this.logger.error(message, { context: this.context, stack: trace })
  }

  warn(message: string) {
    this.logger.warn(message, { context: this.context })
  }

  debug(message: string) {
    this.logger.debug(message, { context: this.context })
  }

  verbose(message: string) {
    this.logger.verbose(message, { context: this.context })
  }

  success(message: string) {
    this.logger.info(`✅ ${message}`, { context: this.context })
  }

  info(message: string) {
    this.logger.info(message, { context: this.context })
  }
}
