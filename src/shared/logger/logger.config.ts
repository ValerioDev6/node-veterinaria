import path from 'path'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const { combine, timestamp, printf, colorize, errors } = winston.format

// Formato personalizado (estilo NestJS) - SIN ERRORES DE TS
const nestLikeFormat = printf((info) => {
  const { level, message, timestamp, context, stack } = info
  const pid = process.pid

  // ✅ Fix: Convertir timestamp a string
  const time = new Date(timestamp as string).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const contextStr = context ? `[${context}] ` : ''
  const stackStr = stack ? `\n${stack}` : ''

  return `[Nest] ${pid}  - ${time}   ${level} ${contextStr}${message}${stackStr}`
})

// Transports para logs
const transports: winston.transport[] = [
  // Console con colores
  new winston.transports.Console({
    format: combine(colorize({ all: true }), timestamp(), nestLikeFormat),
  }),
]

// Solo en producción: guardar logs en archivos
if (process.env.NODE_ENV === 'production') {
  // Logs de error
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      maxSize: '20m',
      format: combine(
        timestamp(),
        errors({ stack: true }),
        winston.format.json()
      ),
    })
  )

  // Logs combinados
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',
      format: combine(timestamp(), winston.format.json()),
    })
  )
}

// Configuración de Winston
export const winstonConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({ stack: true })),
  transports,
  exitOnError: false,
}
