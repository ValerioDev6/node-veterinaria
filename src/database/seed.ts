import { DatabaseSeeder } from './seeder/database.seeder'

const seederClass = process.argv[2] // Ejemplo: pnpm seed UserSeeder

const databaseSeeder = new DatabaseSeeder()
databaseSeeder.run(seederClass)
