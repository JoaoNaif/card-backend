import type { Request, Response } from 'express'
import { CreateUserUseCase } from '../../use-cases/User/create-user'
import z from 'zod'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'

export const createUserBodySchema = z.object({
  name: z.string(),
  email: z.email(),
})

const validateBody = zodValidationPipe(createUserBodySchema)

export class CreateUserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void> => {
      const { name, email } = req.body

      const result = await this.createUserUseCase.execute({ name, email })

      if (result.isLeft()) {
        res.status(409).json({ message: result.value.message })
        return
      }

      res.status(201).json(result.value.user)
    },
  ]
}
