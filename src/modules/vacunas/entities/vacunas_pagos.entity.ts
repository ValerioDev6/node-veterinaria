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

@Entity({ name: 'vacunas_pagos' })
export class VacunasPagosEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  adelanto: number

  @Column({ type: 'varchar', length: 50 })
  metodo_pago: string

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  estado: string

  @ManyToOne(() => VacunaEntity, (vacuna) => vacuna.pagos)
  @JoinColumn({ name: 'vacuna_id' })
  vacuna: VacunaEntity

  @Column({ type: 'int' })
  vacuna_id: number

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
