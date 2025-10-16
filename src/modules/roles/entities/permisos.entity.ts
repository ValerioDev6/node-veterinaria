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
import { ObjectEntity } from './object.entity'
import { RolePermissionEntity } from './role_permissions.entity'

@Entity({ name: 'permissions' })
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  action: string

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

  @ManyToOne(() => ObjectEntity, (object) => object.permissions)
  @JoinColumn({ name: 'objectId' })
  object: ObjectEntity

  @OneToMany(
    () => RolePermissionEntity,
    (rolePermission) => rolePermission.permissions
  )
  role_permissions!: RolePermissionEntity[]
}
