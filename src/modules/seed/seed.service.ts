import { bcryptAdapter } from '@config/bycrypt.adapter'
import { getRepositoryFactory } from '@config/typeorm.repository'
import { ObjectEntity } from '@modules/roles/entities/object.entity'
import { PermissionEntity } from '@modules/roles/entities/permisos.entity'
import { RolePermissionEntity } from '@modules/roles/entities/role_permissions.entity'
import { RoleEntity } from '@modules/roles/entities/roles.entity'
import { UserEntity } from '@modules/user/entities/user.entity'
import { Repository } from 'typeorm'

export class SeedService {
  private objectRepository: Repository<ObjectEntity>
  private permissionRepository: Repository<PermissionEntity>
  private roleRepository: Repository<RoleEntity>
  private rolePermissionRepository: Repository<RolePermissionEntity>
  private userRepository: Repository<UserEntity>

  constructor() {
    this.objectRepository = getRepositoryFactory(ObjectEntity)
    this.permissionRepository = getRepositoryFactory(PermissionEntity)
    this.roleRepository = getRepositoryFactory(RoleEntity)
    this.rolePermissionRepository = getRepositoryFactory(RolePermissionEntity)
    this.userRepository = getRepositoryFactory(UserEntity)
  }

  async seed() {
    try {
      // ========== CREAR OBJETOS (MÓDULOS) ==========
      const objectsData = [
        { name: 'dashboard' },
        { name: 'roles' },
        { name: 'staff' },
        { name: 'veterinaries' },
        { name: 'pets' },
        { name: 'appointments' },
        { name: 'calendar' },
        { name: 'payments' },
        { name: 'vaccinations' },
        { name: 'surgeries' },
        { name: 'medical_records' },
      ]

      const createdObjects = await Promise.all(
        objectsData.map(async (objectData) => {
          let existingObject = await this.objectRepository.findOne({
            where: { name: objectData.name },
          })

          if (!existingObject) {
            existingObject = this.objectRepository.create(objectData)
            await this.objectRepository.save(existingObject)
          }
          return existingObject
        })
      )

      // Obtener todos los objetos
      const dashboardObject = await this.objectRepository.findOne({
        where: { name: 'dashboard' },
      })
      const roleObject = await this.objectRepository.findOne({
        where: { name: 'roles' },
      })
      const staffObject = await this.objectRepository.findOne({
        where: { name: 'staff' },
      })
      const veterinaryObject = await this.objectRepository.findOne({
        where: { name: 'veterinaries' },
      })
      const petObject = await this.objectRepository.findOne({
        where: { name: 'pets' },
      })
      const appointmentObject = await this.objectRepository.findOne({
        where: { name: 'appointments' },
      })
      const calendarObject = await this.objectRepository.findOne({
        where: { name: 'calendar' },
      })
      const paymentObject = await this.objectRepository.findOne({
        where: { name: 'payments' },
      })
      const vaccinationObject = await this.objectRepository.findOne({
        where: { name: 'vaccinations' },
      })
      const surgeryObject = await this.objectRepository.findOne({
        where: { name: 'surgeries' },
      })
      const medicalRecordObject = await this.objectRepository.findOne({
        where: { name: 'medical_records' },
      })

      if (
        !dashboardObject ||
        !roleObject ||
        !staffObject ||
        !veterinaryObject ||
        !petObject ||
        !appointmentObject ||
        !calendarObject ||
        !paymentObject ||
        !vaccinationObject ||
        !surgeryObject ||
        !medicalRecordObject
      ) {
        throw new Error(
          'No se pudieron crear o encontrar todos los objetos necesarios.'
        )
      }

      // ========== CREAR PERMISOS (EXACTAMENTE COMO EN LARAVEL) ==========
      const permissionsData = [
        // Dashboard
        { action: 'show_report_grafics', object: dashboardObject },

        // Roles
        { action: 'register_rol', object: roleObject },
        { action: 'list_rol', object: roleObject },
        { action: 'edit_rol', object: roleObject },
        { action: 'delete_rol', object: roleObject },

        // Veterinarios
        { action: 'register_veterinary', object: veterinaryObject },
        { action: 'list_veterinary', object: veterinaryObject },
        { action: 'edit_veterinary', object: veterinaryObject },
        { action: 'delete_veterinary', object: veterinaryObject },
        { action: 'profile_veterinary', object: veterinaryObject },

        // Mascotas (Pets)
        { action: 'register_pet', object: petObject },
        { action: 'list_pet', object: petObject },
        { action: 'edit_pet', object: petObject },
        { action: 'delete_pet', object: petObject },
        { action: 'profile_pet', object: petObject },

        // Staff
        { action: 'register_staff', object: staffObject },
        { action: 'list_staff', object: staffObject },
        { action: 'edit_staff', object: staffObject },
        { action: 'delete_staff', object: staffObject },

        // Citas (Appointments)
        { action: 'register_appointment', object: appointmentObject },
        { action: 'list_appointment', object: appointmentObject },
        { action: 'edit_appointment', object: appointmentObject },
        { action: 'delete_appointment', object: appointmentObject },

        // Pagos (Payments)
        { action: 'show_payment', object: paymentObject },
        { action: 'edit_payment', object: paymentObject },

        // Calendario
        { action: 'calendar', object: calendarObject },

        // Vacunas (Vaccinations)
        { action: 'register_vaccionation', object: vaccinationObject },
        { action: 'list_vaccionation', object: vaccinationObject },
        { action: 'edit_vaccionation', object: vaccinationObject },
        { action: 'delete_vaccionation', object: vaccinationObject },

        // Cirugías (Surgeries)
        { action: 'register_surgeries', object: surgeryObject },
        { action: 'list_surgeries', object: surgeryObject },
        { action: 'edit_surgeries', object: surgeryObject },
        { action: 'delete_surgeries', object: surgeryObject },

        // Historial Médico (Medical Records)
        { action: 'show_medical_records', object: medicalRecordObject },
      ]

      const createdPermissions = await Promise.all(
        permissionsData.map(async (permissionData) => {
          let existingPermission = await this.permissionRepository.findOne({
            where: { action: permissionData.action },
            relations: ['object'],
          })

          if (!existingPermission) {
            existingPermission = this.permissionRepository.create({
              action: permissionData.action,
              object: permissionData.object,
            })
            await this.permissionRepository.save(existingPermission)
          }
          return existingPermission
        })
      )

      // ========== CREAR ROL SUPER_ADMIN ==========
      let superAdminRole = await this.roleRepository.findOne({
        where: { name: 'SUPER_ADMIN' },
      })

      if (!superAdminRole) {
        superAdminRole = this.roleRepository.create({ name: 'SUPER_ADMIN' })
        await this.roleRepository.save(superAdminRole)
      }

      // ========== ASIGNAR TODOS LOS PERMISOS AL SUPER_ADMIN ==========
      const allPermissions = await this.permissionRepository.find()

      await Promise.all(
        allPermissions.map(async (permission) => {
          const existingRolePermission =
            await this.rolePermissionRepository.findOne({
              where: {
                roles: { id: superAdminRole!.id },
                permissions: { id: permission.id },
              },
            })

          if (!existingRolePermission) {
            const rolePermission = this.rolePermissionRepository.create({
              roles: superAdminRole!,
              permissions: permission,
            })
            await this.rolePermissionRepository.save(rolePermission)
          }
        })
      )

      // ========== CREAR USUARIO SUPER_ADMIN ==========
      let superAdminUser = await this.userRepository.findOne({
        where: { email: 'superadmin@gmail.com' },
      })

      if (!superAdminUser) {
        const hashedPassword = await bcryptAdapter.hash('superadmin123')
        superAdminUser = this.userRepository.create({
          email: 'superadmin@gmail.com',
          username: 'superadmin',
          birthday: new Date(1990, 0, 1),
          password: hashedPassword,
          roles: superAdminRole,
        })
        await this.userRepository.save(superAdminUser)
      }

      const userCount = await this.userRepository.count()
      const rolePermissionCount = await this.rolePermissionRepository.count()

      console.log('\n========== ✅ SEED COMPLETADO ==========')
      console.log(`📦 Objetos: ${createdObjects.length}`)
      console.log(`🔑 Permisos: ${createdPermissions.length}`)
      console.log(`👥 Roles: 1 (SUPER_ADMIN)`)
      console.log(`🔗 Relaciones: ${rolePermissionCount}`)
      console.log(`👤 Usuarios: ${userCount}`)
      console.log(`🔐 Credenciales: superadmin@gmail.com / superadmin123`)
      console.log('========================================\n')

      return {
        message: '✅ Seed completado exitosamente',
        objects: createdObjects.length,
        permissions: createdPermissions.length,
        roles: 1,
        rolePermissions: rolePermissionCount,
        users: userCount,
      }
    } catch (error) {
      console.error('❌ Error en seed:', error)
      throw new Error(`Error en seed: ${error}`)
    }
  }
}
