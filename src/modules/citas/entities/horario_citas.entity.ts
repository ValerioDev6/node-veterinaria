import { VeterinarianScheduleHourEntity } from '@modules/user/entities/veterinarian_schedule_hours.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { CitaEntity } from './citas.entity'

@Entity({ name: 'horario_citas' })
export class HorarioCitas {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => CitaEntity)
  @JoinColumn({ name: 'appointment_id' })
  cita: CitaEntity

  @Column({ type: 'bigint', nullable: true })
  appointment_id: number

  @ManyToOne(() => VeterinarianScheduleHourEntity)
  @JoinColumn({ name: 'veterinarie_schedule_hour_id' })
  schedule_hour: VeterinarianScheduleHourEntity

  @Column({ type: 'bigint', nullable: true })
  veterinarie_schedule_hour_id: number

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  created_at: Date

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updated_at: Date
}
