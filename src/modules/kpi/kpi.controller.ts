import { CustomError } from '@shared/errors'
import { Request, Response } from 'express'
import { KPIService } from './kpi.service'

export class KPIController {
  constructor(private readonly _kpiService: KPIService = new KPIService()) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }

  getKpiData = (req: Request, res: Response) => {
    this._kpiService
      .getKPIs()
      .then((kpi) => res.json(kpi))
      .catch((error) => this.handleError(error, res))
  }

  getKpiVeterinarios = (req: Request, res: Response) => {
    this._kpiService
      .getTotalVeterinarios()
      .then((kpi) => res.json(kpi))
      .catch((error) => this.handleError(error, res))
  }
}
