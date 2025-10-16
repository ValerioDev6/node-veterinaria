export interface ScheduleHourItem {
  day: string // 'monday', 'tuesday', etc.
  segment_time_id: number // ID del slot de hora
}
export interface CreateVeterinarianDto {
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
