import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from './user.entity'
import { VeterinarianScheduleJoinEntity } from './veterinarian_schedule_joins.entity'

@Entity({ name: 'veterinarian_schedule_days' })
export class VeterinarianScheduleDayEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ type: 'uuid', nullable: false })
  veterinarian_id: string

  @Column({ type: 'varchar', length: 20, nullable: false })
  day: string // 'monday', 'tuesday', etc.

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date

  @ManyToOne(() => UserEntity, (user) => user.schedule_days, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'veterinarian_id' })
  veterinarian: UserEntity

  @OneToMany(() => VeterinarianScheduleJoinEntity, (join) => join.schedule_day)
  schedule_joins: VeterinarianScheduleJoinEntity[]
}
