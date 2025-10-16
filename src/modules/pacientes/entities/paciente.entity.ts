import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { OwnerEntity } from './dueno.entity'

@Entity({ name: 'pacientes' })
export class PacienteEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 100 })
  species: string

  @Column({ type: 'varchar', length: 100 })
  breed: string

  @Column({ type: 'timestamp' })
  birth_date: Date

  @Column({ type: 'varchar', length: 50, nullable: true })
  gender: string

  @Column({ type: 'text', nullable: true })
  color: string

  @Column({ type: 'float', nullable: true })
  weight: number

  @Column({ type: 'text', nullable: true })
  photo: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo_public_id: string

  @Column({ type: 'text', nullable: true })
  medical_notes: string

  @ManyToOne(() => OwnerEntity)
  @JoinColumn({ name: 'owner_id' })
  owner: OwnerEntity

  @Column({ type: 'int' })
  owner_id: number

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
