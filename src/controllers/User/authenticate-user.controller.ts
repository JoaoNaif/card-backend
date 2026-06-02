import z from 'zod'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { AuthenticateUserUseCase } from '../../use-cases/User/authenticate-user'
import type { Request, Response } from 'express'

export const authenticateUserController = z.object({
  email: z.string(),
  password: z.string(),
})

const validateBody = zodValidationPipe(authenticateUserController)

export class AuthenticateUserController {
  constructor(private authenticateUserUseCase: AuthenticateUserUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body

      const result = await this.authenticateUserUseCase.execute({
        email,
        password,
      })

      if (result.isLeft()) {
        res.status(401).json({ message: result.value.message })
        return
      }

      res.cookie('token', result.value.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      res.status(200).json({ message: 'Authenticated successfully.' })
    },
  ]
}
