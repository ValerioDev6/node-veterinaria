import { UserEntity } from '@modules/user/entities/user.entity'
import { UserResponseDto } from './user-response.dto'

export class LoginResponseDto {
  user: UserResponseDto
  token: string
  constructor(user: UserEntity, token: string) {
    this.user = new UserResponseDto(user)
    this.token = token
  }
}
