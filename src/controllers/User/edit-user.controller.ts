import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { EditUserUseCase } from '../../use-cases/User/edit-user'

export const editUserBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
})

const validateBody = zodValidationPipe(editUserBodySchema)

export class EditUserController {
  constructor(private editUserUseCase: EditUserUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { name, email } = req.body

      const result = await this.editUserUseCase.execute({
        userId: id,
        name,
        email,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
