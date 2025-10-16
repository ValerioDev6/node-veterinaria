import { bcryptAdapter } from '@config/bycrypt.adapter'
import { JWTAdapter } from '@config/jwt.adapter'
import { getRepositoryFactory } from '@config/typeorm.repository'
import { CreateUserData } from '@modules/user/dto/create-user.dto'
import { UserEntity } from '@modules/user/entities/user.entity'
import { CustomError } from '@shared/errors'
import type { Repository } from 'typeorm'
import { LoginUserDto } from '../dto/login-user.dto'
import { LoginResponseDto } from '../dto/login-response.dto'

export class AuthService {
  private readonly userRepository: Repository<UserEntity>
  constructor() {
    this.userRepository = getRepositoryFactory(UserEntity)
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: {
        id: true,
        email: true,
        password: true,
        avatar: true,
      },
      relations: {
        roles: {
          role_permissions: {
            permissions: true,
          },
        },
      },
    })

    if (!user) throw CustomError.badRequest('Credenciales no válidas')

    const isMatch = bcryptAdapter.compare(loginUserDto.password, user.password)
    if (!isMatch)
      throw CustomError.badRequest('Usuario o contraseña no válidos')

    const token = await JWTAdapter.generateToken({ id: user.id })
    if (!token) throw CustomError.internalServe('Error al crear el JWT')
    return new LoginResponseDto(user, token);
  }

  async register(createUserDto: CreateUserData) {
    const userByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    })
    if (userByEmail) throw CustomError.badRequest('Email already in use')
    try {
      // hasheamos passowrd
      const hashedPassword = bcryptAdapter.hash(createUserDto.password)

      // guardamos usuarios
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        roles: { id: createUserDto.roleId },
      })
      await this.userRepository.save(user)

      const token = await JWTAdapter.generateToken({ id: user.id })
      if (!token) throw CustomError.internalServe('Error wile creating JWT')

      return {
        msg: true,
        user: user,
        token: token,
      }
    } catch (error) {
      throw CustomError.internalServe(`Internal Error ${error}`)
    }
  }
  async profileUser(userId: string) {
    try {
      // Buscar el usuario completo con sus datos actuales
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          avatar: true,
          // Agregar otros campos que necesites EXCEPTO password
        },
        relations: {
          roles: {
            role_permissions: {
              permissions: true,
            },
          },
        },
      })

      if (!user) throw CustomError.notFound('Usuario no encontrado')

      // Generar nuevo token (refresh del token)
      const token = await JWTAdapter.generateToken({ id: user.id })
      if (!token) throw CustomError.internalServe('Error while creating JWT')

      return new LoginResponseDto(user, token);

    } catch (error) {
      if (error instanceof CustomError) throw error
      throw CustomError.internalServe('Error al obtener perfil del usuario')
    }
  }
}
