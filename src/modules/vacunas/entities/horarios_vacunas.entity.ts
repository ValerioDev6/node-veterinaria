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
import { VacunaEntity } from './vacunas.entity'

@Entity({ name: 'vacunas_horarios' })
export class VacunasHorariasEntity {
  @PrimaryGeneratedColumn('increment')
  id: number
  @Column({ type: 'varchar', nullable: true })
  hour: string

  @ManyToOne(() => VacunaEntity)
  @JoinColumn({ name: 'vaccination_id' })
  vacunas: VacunaEntity

  @Column({ type: 'bigint', nullable: true })
  vaccination_id: number

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
