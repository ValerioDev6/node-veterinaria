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
import { SurgiereEntity } from './surgiere.entity'

@Entity({ name: 'surgiere_schedule' })
export class SurigereSheduleEntity {
  @PrimaryGeneratedColumn('increment')
  id: number
  @Column({ type: 'varchar', nullable: true })
  hour: string

  @ManyToOne(() => SurgiereEntity)
  @JoinColumn({ name: 'surgiere_id' })
  surgiere: SurgiereEntity

  @Column({ type: 'bigint', nullable: true })
  surgiere_id: number

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
