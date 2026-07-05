import type { Request, Response } from 'express'
import { CreateUserUseCase } from '../../use-cases/User/create-user'
import z from 'zod'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'

export const createUserBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
})

const validateBody = zodValidationPipe(createUserBodySchema)

export class CreateUserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void> => {
      const { name, email, password } = req.body

      const result = await this.createUserUseCase.execute({
        name,
        email,
        password,
      })

      if (result.isLeft()) {
        res.status(409).json({ message: result.value.message })
        return
      }

      res.cookie('token', result.value.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      res.status(201).json(result.value.user)
    },
  ]
}
