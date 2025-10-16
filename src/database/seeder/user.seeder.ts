import { bcryptAdapter } from '@config/bycrypt.adapter'
import { getRepositoryFactory } from '@config/typeorm.repository'
import { faker } from '@faker-js/faker'
import { RoleEntity } from '@modules/roles/entities/roles.entity'
import { UserEntity } from '@modules/user/entities/user.entity'
import { Repository } from 'typeorm'
import { BaseSeeder } from './base.seeder'

export class UserSeeder extends BaseSeeder {
  private userRepository: Repository<UserEntity>
  private roleRepository: Repository<RoleEntity>

  constructor() {
    super()
    this.userRepository = getRepositoryFactory(UserEntity)
    this.roleRepository = getRepositoryFactory(RoleEntity)
  }

  async run(): Promise<void> {
    console.log('🌱 Seeding users...')

    // ========== SUPER ADMIN ==========
    const superAdminRole = await this.roleRepository.findOne({
      where: { name: 'SUPER_ADMIN' },
    })

    if (!superAdminRole) {
      throw new Error('❌ SUPER_ADMIN role not found. Run RoleSeeder first.')
    }

    await this.createSuperAdmin(superAdminRole)

    // ========== USUARIOS FAKE (OPCIONAL) ==========
    await this.createFakeUsersByRole('ADMIN', 2)
    await this.createFakeUsersByRole('VETERINARIO', 3)
    await this.createFakeUsersByRole('CLIENTE', 5)

    console.log('✅ Users seeded successfully\n')
  }

  // Crear Super Admin
  private async createSuperAdmin(role: RoleEntity): Promise<void> {
    const exists = await this.userRepository.findOne({
      where: { email: 'programador@gmail.com' },
    })

    if (exists) {
      console.log('  ⚠️  Super Admin ya existe')
      return
    }

    const superAdmin = this.userRepository.create({
      username: 'programador',
      email: 'programador@gmail.com',
      password: await bcryptAdapter.hash('programador123'),
      birthday: new Date(1990, 0, 1),
      email_verified_at: true,
      phone: '999888777',
      type_documento: 'DNI',
      n_documento: '12345678',
      roles: role,
    })

    await this.userRepository.save(superAdmin)
    console.log(
      '  ✅ Super Admin creado: programador@gmail.com / programador123'
    )
  }

  // Crear usuarios fake por rol
  private async createFakeUsersByRole(
    roleName: string,
    count: number
  ): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    })

    if (!role) {
      console.log(`  ⚠️  Rol ${roleName} no encontrado, saltando...`)
      return
    }

    for (let i = 0; i < count; i++) {
      const fakeUser = await this.generateFakeUser(role)

      const exists = await this.userRepository.findOne({
        where: { email: fakeUser.email },
      })

      if (!exists) {
        await this.userRepository.save(fakeUser)
        console.log(`  ✅ ${roleName} creado: ${fakeUser.email} / password123`)
      }
    }
  }

  // Generar un usuario fake con Faker
  private async generateFakeUser(role: RoleEntity): Promise<UserEntity> {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const username = faker.internet.username({ firstName, lastName })

    return this.userRepository.create({
      username: username.toLowerCase(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: await bcryptAdapter.hash('password123'),
      phone: faker.phone.number({ style: 'national' }),
      type_documento: faker.helpers.arrayElement(['DNI', 'CE', 'PASAPORTE']),
      n_documento: faker.string.numeric(8),
      birthday: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      avatar: faker.image.avatar(),
      email_verified_at: faker.datatype.boolean(),
      roles: role,
    })
  }
}
