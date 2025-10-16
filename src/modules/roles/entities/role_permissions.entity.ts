import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { PermissionEntity } from './permisos.entity'
import { RoleEntity } from './roles.entity'

@Entity({ name: 'role_permissions' })
export class RolePermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

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

  @ManyToOne(() => RoleEntity, (role) => role.role_permissions)
  @JoinColumn({ name: 'roleId' })
  roles: RoleEntity

  @ManyToOne(
    () => PermissionEntity,
    (permission) => permission.role_permissions
  )
  @JoinColumn({ name: 'permissionId' })
  permissions: PermissionEntity
}
