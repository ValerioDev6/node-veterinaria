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
import { SurigerePaymentEntity } from './surgiere_payment.entity'

@Entity({ name: 'surgiere' })
export class SurgiereEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ type: 'text', nullable: true })
  medical_notes: string

  @Column({ type: 'varchar' })
  day: string

  @Column({ type: 'datetime' })
  surgerie_date: Date

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'veterinarian_id' })
  veterinarian: UserEntity

  @Column({ type: 'bigint' })
  veterinarian_id: number

  @ManyToOne(() => PacienteEntity)
  @JoinColumn({ name: 'pet_id' })
  pet: PacienteEntity

  @Column({ type: 'bigint' })
  pet_id: number

  @Column({ type: 'text', nullable: true })
  outcome: string

  @Column({ type: 'varchar', default: 'pendiente' })
  state: string

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  state_payment: string

  @Column({ type: 'varchar', nullable: true })
  surgerie_type: string

  @Column({ type: 'smallint', default: 0 })
  outside: number

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ type: 'uuid' })
  user_id: string

  @OneToMany(() => SurigerePaymentEntity, (pago) => pago.surgiere)
  pagos: SurigerePaymentEntity[]

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
