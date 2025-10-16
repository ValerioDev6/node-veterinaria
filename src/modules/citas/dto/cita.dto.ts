export interface CreateCitaDto {
  day: Date;
  reason: string;
  reprograming?: boolean;
  state?: string;
  pet_id: number;
  veterinarian_id: string;
  schedule_id: string;

  adelanto: number;
  monto: number;
  metodo_pago: string;
}
