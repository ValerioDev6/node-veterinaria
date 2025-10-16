import { PacienteEntity } from '@modules/pacientes/entities/paciente.entity'
import { SurgiereEntity } from '@modules/surgical-procedures/entities/surgiere.entity'
import { UserEntity } from '@modules/user/entities/user.entity'
import { VacunaEntity } from '@modules/vacunas/entities/vacunas.entity'
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

@Entity({ name: 'medical_record' })
export class MedicalRecordEntity {
  @PrimaryGeneratedColumn('increment')
  id: number
  @ManyToOne(() => PacienteEntity)
  @JoinColumn({ name: 'pet_id' })
  pet: PacienteEntity

  @Column({ type: 'bigint', nullable: true })
  pet_id: number

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'veterinarian_id' })
  veterinarian: UserEntity

  @Column({ type: 'uuid' })
  veterinarian_id: string

  @Column({ type: 'bigint', nullable: true })
  event_type: number

  @ManyToOne(() => CitaEntity)
  @JoinColumn({ name: 'appointment_id' })
  cita: CitaEntity

  @Column({ type: 'bigint', nullable: true })
  appointment_id: number

  @ManyToOne(() => VacunaEntity)
  @JoinColumn({ name: 'vaccination_id' })
  vacuna: VacunaEntity

  @Column({ type: 'bigint', nullable: true })
  vaccination_id: number

  @ManyToOne(() => SurgiereEntity)
  @JoinColumn({ name: 'surgerie_id' })
  surgiere: SurgiereEntity

  @Column({ type: 'bigint', nullable: true })
  surgerie_id: number

  @Column({ type: 'bigint', nullable: true })
  event_date: number

  @Column({ type: 'text', nullable: true })
  notes: string | null

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
