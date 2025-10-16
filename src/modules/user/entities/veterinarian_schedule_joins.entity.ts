import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { VeterinarianScheduleDayEntity } from './veterinarian_schedule_days.entity'
import { VeterinarianScheduleHourEntity } from './veterinarian_schedule_hours.entity'

@Entity({ name: 'veterinarian_schedule_joins' })
export class VeterinarianScheduleJoinEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ type: 'bigint', nullable: false })
  veterinarian_schedule_day_id: number

  @Column({ type: 'bigint', nullable: false })
  veterinarian_schedule_hour_id: number

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date

  @ManyToOne(() => VeterinarianScheduleDayEntity, (day) => day.schedule_joins, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'veterinarian_schedule_day_id' })
  schedule_day: VeterinarianScheduleDayEntity

  @ManyToOne(
    () => VeterinarianScheduleHourEntity,
    (hour) => hour.schedule_joins,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'veterinarian_schedule_hour_id' })
  schedule_hour: VeterinarianScheduleHourEntity
}
