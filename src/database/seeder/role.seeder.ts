import { getRepositoryFactory } from '@config/typeorm.repository'
import { RoleEntity } from '@modules/roles/entities/roles.entity'
import { Repository } from 'typeorm'
import { BaseSeeder } from './base.seeder'

export class RoleSeeder extends BaseSeeder {
  private roleRepository: Repository<RoleEntity>

  constructor() {
    super()
    this.roleRepository = getRepositoryFactory(RoleEntity)
  }

  async run(): Promise<void> {
    console.log('🌱 Seeding roles...')

    const roles = [
      { name: 'ADMIN', description: 'Administrador' },
      { name: 'VETERINARIO', description: 'Veterinario' },
      { name: 'RECEPCIONISTA', description: 'Recepcionista' },
      { name: 'CLIENTE', description: 'Cliente/Dueño de mascota' },
    ]

    for (const roleData of roles) {
      const exists = await this.roleRepository.findOne({
        where: { name: roleData.name },
      })

      if (!exists) {
        const role = this.roleRepository.create(roleData)
        await this.roleRepository.save(role)
        console.log(`  ✅ Rol creado: ${roleData.name}`)
      } else {
        console.log(`  ⚠️  Rol ya existe: ${roleData.name}`)
      }
    }

    console.log('✅ Roles seeded successfully\n')
  }
}
