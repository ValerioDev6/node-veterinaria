import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'owners' })
export class OwnerEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ type: 'varchar', length: 100 })
  first_name: string

  @Column({ type: 'varchar', length: 100 })
  last_name: string

  @Column({ type: 'varchar', length: 100 })
  email: string

  @Column({ type: 'varchar', length: 20 })
  phone: string

  @Column({ type: 'varchar', length: 200 })
  address: string

  @Column({ type: 'varchar', length: 100 })
  city: string

  @Column({ type: 'varchar', length: 100 })
  type_documento: string

  @Column({ type: 'varchar', length: 100 })
  n_documento: string

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
