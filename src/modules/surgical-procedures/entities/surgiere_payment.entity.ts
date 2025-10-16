import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { SurgiereEntity } from './surgiere.entity'

@Entity({ name: 'surgiere_payment' })
export class SurigerePaymentEntity {
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

  @ManyToOne(() => SurgiereEntity, (surgiere) => surgiere.pagos)
  @JoinColumn({ name: 'surgiere_id' })
  surgiere: SurgiereEntity

  @Column({ type: 'int' })
  surgiere_id: number

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
