import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '../../user/entities/user.entity'
import { RolePermissionEntity } from './role_permissions.entity'

@Entity({ name: 'roles' })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 250 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

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

  @OneToMany(
    () => RolePermissionEntity,
    (rolePermission) => rolePermission.roles
  )
  role_permissions: RolePermissionEntity[]

  @OneToMany(() => UserEntity, (user) => user.roles)
  users: UserEntity[]
}
