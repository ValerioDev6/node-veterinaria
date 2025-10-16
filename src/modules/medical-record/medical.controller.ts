import { CustomError } from '@shared/errors'
import { Request, Response } from 'express'
import { MedicalRecordService } from './medical.service'

export class MedicalController {
  constructor(
    private readonly _medicalService: MedicalRecordService = new MedicalRecordService()
  ) {}
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }
  getMedicalHistory(req: Request, res: Response) {
    const { pet_name, service_type } = req.query

    if (!pet_name) {
      return res.status(400).json({ error: 'pet_name es requerido' })
    }

    try {
      this._medicalService
        .getMedicalHistoryByPetName(pet_name as string, service_type as string)
        .then((historial) => res.json(historial))
        .catch((error) => this.handleError(error, res))
    } catch (error) {
      res.status(500).json(this.handleError(error, res))
    }
  }
}
