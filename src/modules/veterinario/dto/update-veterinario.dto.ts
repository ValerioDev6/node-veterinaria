import { ScheduleHourItem } from './create-veterinario.dto'

export interface UpdateVeterinarianDto {
  username: string
  email: string
  password: string
  phone: string
  type_documento: string
  n_documento: string
  birthday: Date | string
  roleId: string
  schedule_hour_veterinarie?: string | ScheduleHourItem[]
}
