import { CustomError } from '@shared/errors'
import { Request, Response } from 'express'
import { LoginUserDto } from '../dto/login-user.dto'
import { AuthService } from '../services/auth.service'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }

    return res.status(500).json({ error: 'Internal server error' })
  }
  createUser = (req: Request, res: Response) => {
    this.authService
      .register(req.body)
      .then((user) => res.status(201).json(user))
      .catch((error) => this.handleError(error, res))
  }

  loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const [error, loginUserDto] = LoginUserDto.create(req.body)
      if (error) {
        res.status(400).json({ error })
        return
      }
      const user = await this.authService.loginUser(loginUserDto!)
      res.json(user)
    } catch (error) {
      this.handleError(error, res)
    }
  }

  profileUser = async (req: Request, res: Response) => {
    try {
      const user = req.user!
      const response = await this.authService.profileUser(user.id)
      res.json(response)
    } catch (error) {
      this.handleError(error, res)
    }
  }
}
