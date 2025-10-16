import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { PermissionEntity } from './permisos.entity'

@Entity({ name: 'objects' })
export class ObjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  name: string

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

  @OneToMany(() => PermissionEntity, (permission) => permission.object)
  permissions: PermissionEntity[]
}
