import { AuthRouter } from '@modules/auth/auth.router'
import { CalendarioRouter } from '@modules/calendario/calendario.router'
import { CitasRouter } from '@modules/citas/cita.router'
import { ImagenRouter } from '@modules/images/imagen.router'
import { KPIRouter } from '@modules/kpi/kpi.router'
import { MedicalRecordRouter } from '@modules/medical-record/medical-record.router'
import { PacienteRouter } from '@modules/pacientes/paciente.router'
import { PagosRouter } from '@modules/pagos/pagos.router'
import { RolesRouter } from '@modules/roles/roles.route'
import { SeedRouter } from '@modules/seed/seed.router'
import { SurgicalRouter } from '@modules/surgical-procedures/surgical.router'
import { UserRouter } from '@modules/user/user.route'
import { VacunasRouter } from '@modules/vacunas/vacunas.router'
import { VeterinarioRouter } from '@modules/veterinario/veterinario.router'
import { Router } from 'express'

export class AppRouter {
  static get routes(): Router {
    const router = Router()
    router.use('/v1/api/auth', AuthRouter.routes)
    router.use('/v1/api/seed', SeedRouter.routes)
    router.use('/v1/api/staff', UserRouter.routes)
    router.use('/v1/api/roles', RolesRouter.routes)
    router.use('/v1/api/veterinario', VeterinarioRouter.routes)
    router.use('/v1/api/pacientes', PacienteRouter.routes)

    router.use('/v1/api/citas', CitasRouter.routes)
    router.use('/v1/api/calendar', CalendarioRouter.routes)

    router.use('/v1/api/vacunas', VacunasRouter.routes)
    router.use('/v1/api/cirujias', SurgicalRouter.routes)

    router.use('/v1/api/pagos', PagosRouter.routes)
    router.use('/v1/api/medical-history', MedicalRecordRouter.routes)

    router.use('/v1/api/kpi', KPIRouter.routes)

    // ver imagenes
    router.use('/uploads', ImagenRouter.routes)
    return router
  }
}
