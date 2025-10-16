import { PacienteEntity } from '@modules/pacientes/entities/paciente.entity'
import { UserEntity } from '@modules/user/entities/user.entity'
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
import { HorarioCitas } from './horario_citas.entity'
import { MedicalRecordEntity } from './medical_record.entity'
import { PagoEntity } from './pago.entity'

@Entity({ name: 'citas' })
export class CitaEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ type: 'varchar', length: 20 })
  day: string

  @Column({ type: 'datetime' })
  day_appointment: Date

  @Column({ type: 'text' })
  reason: string

  @Column({ type: 'boolean', default: false })
  reprograming: boolean

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  state_payment: string

  @ManyToOne(() => PacienteEntity)
  @JoinColumn({ name: 'pet_id' })
  pet: PacienteEntity

  @Column({ type: 'int' })
  pet_id: number

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'veterinarian_id' })
  veterinarian: UserEntity

  @Column({ type: 'uuid' })
  veterinarian_id: string

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ type: 'uuid' })
  user_id: string

  @OneToMany(() => HorarioCitas, (horario) => horario.cita)
  horarios: HorarioCitas[]

  @OneToMany(() => PagoEntity, (pago) => pago.cita)
  pagos: PagoEntity[]

  @OneToMany(() => MedicalRecordEntity, (record) => record.cita)
  medical_records: MedicalRecordEntity[]

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
