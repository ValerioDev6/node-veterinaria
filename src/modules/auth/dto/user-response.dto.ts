import { UserEntity } from '@modules/user/entities/user.entity'

export class UserResponseDto {
  id: string
  email: string
  role: string
  avatar: string
  permissions: string[]

  constructor(user: UserEntity) {
    this.id = user.id
    this.email = user.email
    this.avatar = user.avatar as string
    this.role = user.roles.name
    this.permissions = user.roles.role_permissions.map(
      (rp) => rp.permissions.action
    )
  }
}
