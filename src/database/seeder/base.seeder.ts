import { Logger } from '@shared/logger/logger'

export abstract class BaseSeeder {
  protected logger: Logger
  constructor() {
    this.logger = new Logger(this.constructor.name)
  }
  abstract run(): Promise<void>

  protected async execute() {
    try {
      await this.run()
    } catch (error) {
      this.logger.error(
        `Error during seeding: ${
          error instanceof Error ? error.message : error
        }`,
        error instanceof Error ? error.stack : undefined
      )
      throw error
    }
  }
}
