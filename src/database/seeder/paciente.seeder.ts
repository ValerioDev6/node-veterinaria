import { getRepositoryFactory } from '@config/typeorm.repository'
import { OwnerEntity } from '@modules/pacientes/entities/dueno.entity'
import { PacienteEntity } from '@modules/pacientes/entities/paciente.entity'
import { Repository } from 'typeorm'
import { BaseSeeder } from './base.seeder'

export class PacienteSeeder extends BaseSeeder {
  private readonly pacienteRepository: Repository<PacienteEntity>
  private readonly propietarioRespository: Repository<OwnerEntity>

  constructor() {
    super()
    this.pacienteRepository = getRepositoryFactory(PacienteEntity)
    this.propietarioRespository = getRepositoryFactory(OwnerEntity)
  }
  run(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  // Generar un usuario fake con Faker
  // private async generateFakeUser(role): Promise<UserEntity> {
  //   const firstName = faker.person.firstName()
  //   const lastName = faker.person.lastName()
  //   const username = faker.internet.username({ firstName, lastName })

  //   return this.userRepository.create({
  //     username: username.toLowerCase(),
  //     email: faker.internet.email({ firstName, lastName }).toLowerCase(),
  //     password: await bcryptAdapter.hash('password123'),
  //     phone: faker.phone.number({ style: 'national' }),
  //     type_documento: faker.helpers.arrayElement(['DNI', 'CE', 'PASAPORTE']),
  //     n_documento: faker.string.numeric(8),
  //     birthday: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
  //     avatar: faker.image.avatar(),
  //     email_verified_at: faker.datatype.boolean(),
  //     roles: role,
  //   })
  // }
}
