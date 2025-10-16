import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { VeterinarianScheduleJoinEntity } from './veterinarian_schedule_joins.entity'

@Entity({ name: 'veterinarian_schedule_hours' })
export class VeterinarianScheduleHourEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ type: 'time', nullable: false })
  hour_start: string

  @Column({ type: 'time', nullable: false })
  hour_end: string

  @Column({ type: 'varchar', length: 2, nullable: false })
  hour: string

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date

  @OneToMany(() => VeterinarianScheduleJoinEntity, (join) => join.schedule_hour)
  schedule_joins: VeterinarianScheduleJoinEntity[]
}
