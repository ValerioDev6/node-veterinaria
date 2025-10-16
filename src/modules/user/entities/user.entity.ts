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
import { RoleEntity } from '../../roles/entities/roles.entity'
import { VeterinarianScheduleDayEntity } from './veterinarian_schedule_days.entity'

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string

  @Column({ type: 'boolean', default: false })
  email_verified_at: boolean

  @Column({ type: 'varchar', length: 255 })
  password: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  type_documento: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  n_documento: string

  @Column({ type: 'date' })
  birthday: Date

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar_public_id: string | null

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date

  @ManyToOne(() => RoleEntity, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  roles: RoleEntity

  // Solo los veterinarios tienen horarios
  @OneToMany(
    () => VeterinarianScheduleDayEntity,
    (scheduleDay) => scheduleDay.veterinarian
  )
  schedule_days: VeterinarianScheduleDayEntity[]
}
