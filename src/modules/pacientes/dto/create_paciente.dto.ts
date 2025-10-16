// Interfaz para el propietario que incluye un paciente
export interface CreateOwnerWithPatientDto {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  type_documento: string
  n_documento: string

  name: string
  species: string // corregido de "spcice"
  breed: string
  birth_date: string // corregido de "dirth_date"
  gender?: string
  color?: string
  weight?: number
  medical_notes?: string
}
