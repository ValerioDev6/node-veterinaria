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

@Entity({ name: 'pagos' })
export class PagoEntity {
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

  @ManyToOne(() => CitaEntity, (cita) => cita.pagos)
  @JoinColumn({ name: 'cita_id' })
  cita: CitaEntity

  @Column({ type: 'int' })
  cita_id: number

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
