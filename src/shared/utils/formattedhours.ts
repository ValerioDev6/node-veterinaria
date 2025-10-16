import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat) // 🔥 habilita el soporte para formatos personalizados

export function formatHour(hour: string) {
  // hora tipo "08:15:00" → formateado a "08:15 AM"
  return dayjs(hour, 'HH:mm:ss').isValid()
    ? dayjs(hour, 'HH:mm:ss').format('hh:mm A')
    : null
}
