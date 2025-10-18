# 🏥 API Sistema de Gestión Veterinaria

API RESTful completa para la gestión integral de clínicas veterinarias desarrollada con Node.js, TypeScript y TypeORM.

## 📋 Descripción

Backend robusto que proporciona endpoints para la administración de clínicas veterinarias, incluyendo gestión de citas, pacientes, veterinarios, historiales médicos, procedimientos quirúrgicos, vacunaciones y control financiero.

## 🚀 Tecnologías

- **Node.js** - Entorno de ejecución
- **TypeScript** - Lenguaje de programación
- **Express** - Framework web
- **TypeORM** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación y autorización
- **Winston** - Sistema de logs
- **Swagger** - Documentación de API
- **Cloudinary** - Gestión de imágenes
- **Docker** - Contenedorización

## 📁 Estructura del Proyecto

```
src/
├── app.ts                          # Punto de entrada de la aplicación
├── config/                         # Configuraciones generales
│   ├── bycrypt.adapter.ts          # Encriptación de contraseñas
│   ├── cloudinary.ts               # Configuración de Cloudinary
│   ├── data-source.ts              # Conexión a base de datos
│   ├── envs.ts                     # Variables de entorno
│   ├── jwt.adapter.ts              # Configuración JWT
│   ├── multer.config.ts            # Configuración de archivos
│   ├── swagger.ts                  # Documentación API
│   └── typeorm.repository.ts       # Repositorio base TypeORM
│
├── core/                           # Núcleo de la aplicación
│   ├── routes.ts                   # Rutas principales
│   └── server.ts                   # Configuración del servidor
│
├── database/                       # Gestión de base de datos
│   ├── seeder/                     # Datos iniciales
│   │   ├── base.seeder.ts
│   │   ├── database.seeder.ts
│   │   ├── paciente.seeder.ts
│   │   ├── role.seeder.ts
│   │   ├── user.seeder.ts
│   │   └── veterinarie_schedule_hours.seeder.ts
│   └── seed.ts
│
├── migrations/                     # Migraciones de base de datos
│   ├── 1760041967585-InitDatabase.ts
│   ├── 1760205894950-VacunaInitDatabase.ts
│   ├── 1760208125924-ChangeVacunaPaymentEntity.ts
│   ├── 1760406060364-SugiereEntity.ts
│   └── 1760412885900-SugiereEntityChange.ts
│
├── modules/                        # Módulos funcionales
│   ├── auth/                       # Autenticación y autorización
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── services/
│   │   └── auth.router.ts
│   │
│   ├── roles/                      # Gestión de roles y permisos
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── roles.route.ts
│   │
│   ├── user/                       # Gestión de usuarios (staff)
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── middlewares/
│   │   ├── services/
│   │   └── user.route.ts
│   │
│   ├── veterinario/                # Gestión de veterinarios
│   │   ├── dto/
│   │   ├── veterinario.controller.ts
│   │   ├── veterinario.service.ts
│   │   └── veterinario.router.ts
│   │
│   ├── pacientes/                  # Gestión de mascotas
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── services/
│   │   └── paciente.router.ts
│   │
│   ├── citas/                      # Gestión de citas médicas
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── services/
│   │   └── cita.router.ts
│   │
│   ├── calendario/                 # Disponibilidad de veterinarios
│   │   ├── calendario.controller.ts
│   │   ├── calendario.service.ts
│   │   └── calendario.router.ts
│   │
│   ├── pagos/                      # Gestión de pagos
│   │   ├── dto/
│   │   ├── pagos.controller.ts
│   │   ├── pagos.service.ts
│   │   └── pagos.router.ts
│   │
│   ├── vacunas/                    # Control de vacunación
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── vacuna.controller.ts
│   │   ├── vacunas.service.ts
│   │   └── vacunas.router.ts
│   │
│   ├── surgical-procedures/        # Procedimientos quirúrgicos
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── surgical.controller.ts
│   │   ├── surgical.service.ts
│   │   └── surgical.router.ts
│   │
│   ├── medical-record/             # Historial médico
│   │   ├── medical.controller.ts
│   │   ├── medical.service.ts
│   │   └── medical-record.router.ts
│   │
│   ├── kpi/                        # Dashboard y reportes
│   │   ├── kpi.controller.ts
│   │   ├── kpi.service.ts
│   │   └── kpi.router.ts
│   │
│   ├── images/                     # Gestión de imágenes
│   │   ├── imagen.controller.ts
│   │   └── imagen.router.ts
│   │
│   └── seed/                       # Endpoint para seeders
│       ├── seed.controller.ts
│       ├── seed.service.ts
│       └── seed.router.ts
│
└── shared/                         # Recursos compartidos
    ├── dtos/                       # DTOs globales
    ├── enums/                      # Enumeraciones
    ├── errors/                     # Manejo de errores
    ├── logger/                     # Sistema de logs
    ├── middlewares/                # Middlewares globales
    │   ├── auth.middleware.ts
    │   ├── error.middleware.ts
    │   ├── logger.middleware.ts
    │   ├── permission.middleware.ts
    │   └── role.middleware.ts
    ├── response/                   # Respuestas HTTP estandarizadas
    ├── services/                   # Servicios compartidos
    └── utils/                      # Utilidades
```

## 🔑 Características Principales

### Seguridad y Autenticación

- ✅ Autenticación JWT
- ✅ Sistema de roles y permisos granular
- ✅ Middlewares de autorización
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Validación de datos con DTOs

### Gestión de Datos

- ✅ TypeORM con PostgreSQL
- ✅ Migraciones automáticas
- ✅ Seeders para datos iniciales
- ✅ Relaciones complejas entre entidades
- ✅ Paginación en listados

### Funcionalidades Médicas

- ✅ Gestión de citas médicas
- ✅ Historial clínico completo
- ✅ Control de vacunación
- ✅ Registro de cirugías
- ✅ Calendario de disponibilidad
- ✅ Sistema de pagos

### Infraestructura

- ✅ Sistema de logs con Winston
- ✅ Documentación con Swagger
- ✅ Upload de imágenes a Cloudinary
- ✅ Docker para desarrollo
- ✅ Manejo centralizado de errores
- ✅ CORS configurado

## 🛠️ Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL
- pnpm (recomendado)

### Pasos de instalación

```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
pnpm run migration:run

# Ejecutar seeders (opcional)
pnpm run seed

# Iniciar en desarrollo
pnpm run dev
```

## 🐳 Docker

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📝 Variables de Entorno

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=veterinaria

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=http://localhost:4200
```

## 💻 Scripts Disponibles

```bash
# Desarrollo
pnpm run dev              # Inicia servidor en modo desarrollo

# Producción
pnpm run build           # Compila TypeScript
pnpm start              # Inicia servidor en producción

# Base de datos
pnpm run migration:generate  # Genera nueva migración
pnpm run migration:run      # Ejecuta migraciones
pnpm run migration:revert   # Revierte última migración
pnpm run seed              # Ejecuta seeders

# Testing
pnpm test               # Ejecuta tests
pnpm run test:watch    # Tests en modo watch

# Linting
pnpm run lint          # Ejecuta linter
pnpm run lint:fix      # Corrige errores automáticamente

# Formato
pnpm run format        # Formatea código con Biome
```

## 📚 Documentación API

La documentación completa de la API está disponible en Swagger:

```
http://localhost:3000/api-docs
```

## 🗂️ Principales Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/validate` - Validar token

### Roles y Permisos

- `GET /api/roles` - Listar roles
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol

### Usuarios (Staff)

- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Veterinarios

- `GET /api/veterinarios` - Listar veterinarios
- `POST /api/veterinarios` - Crear veterinario
- `PUT /api/veterinarios/:id` - Actualizar veterinario
- `DELETE /api/veterinarios/:id` - Eliminar veterinario

### Mascotas (Pacientes)

- `GET /api/pacientes` - Listar mascotas
- `POST /api/pacientes` - Registrar mascota
- `PUT /api/pacientes/:id` - Actualizar mascota
- `DELETE /api/pacientes/:id` - Eliminar mascota

### Citas Médicas

- `GET /api/citas` - Listar citas
- `POST /api/citas` - Agendar cita
- `PUT /api/citas/:id` - Actualizar cita
- `DELETE /api/citas/:id` - Cancelar cita

### Vacunas

- `GET /api/vacunas` - Listar vacunas
- `POST /api/vacunas` - Registrar vacuna
- `PUT /api/vacunas/:id` - Actualizar vacuna
- `DELETE /api/vacunas/:id` - Eliminar vacuna

### Cirugías

- `GET /api/surgical-procedures` - Listar cirugías
- `POST /api/surgical-procedures` - Registrar cirugía
- `PUT /api/surgical-procedures/:id` - Actualizar cirugía
- `DELETE /api/surgical-procedures/:id` - Eliminar cirugía

### Pagos

- `GET /api/pagos` - Listar pagos
- `POST /api/pagos` - Registrar pago
- `PUT /api/pagos/:id` - Actualizar pago

### Dashboard

- `GET /api/kpi/stats` - Obtener estadísticas

## 📊 Sistema de Logs

Los logs se almacenan en la carpeta `logs/`:

- `combined-*.log` - Logs generales
- `error-*.log` - Solo errores

## 🔐 Sistema de Permisos

La API utiliza un sistema granular de permisos:

- `show_report_grafics` - Ver gráficos del dashboard
- `register_rol`, `list_rol`, `edit_rol`, `delete_rol` - Gestión de roles
- `register_staff`, `list_staff`, `edit_staff`, `delete_staff` - Gestión de personal
- `register_veterinary`, `list_veterinary`, `edit_veterinary`, `delete_veterinary`, `profile_veterinary` - Gestión de veterinarios
- `register_pet`, `list_pet`, `edit_pet`, `delete_pet`, `profile_pet` - Gestión de mascotas
- `register_appointment`, `list_appointment`, `edit_appointment`, `delete_appointment` - Gestión de citas
- `calendar` - Ver calendario
- `show_payment`, `edit_payment` - Gestión de pagos
- `register_vaccionation`, `list_vaccionation`, `edit_vaccionation`, `delete_vaccionation` - Gestión de vacunas
- `register_surgeries`, `list_surgeries`, `edit_surgeries`, `delete_surgeries` - Gestión de cirugías
- `show_medical_records` - Ver historial médico

## 👨‍💻 Autor

[Valerio]

---

Desarrollado con ❤️ usando Node.js, TypeScript y TypeORM
