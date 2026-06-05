import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { CreatePowerUseCase } from '../../use-cases/Power/create-power'

export const createPowerBodySchema = z.object({
  name: z.string(),
  description: z.string(),
})

const validateBody = zodValidationPipe(createPowerBodySchema)

export class CreatePowerController {
  constructor(private createPowerUseCase: CreatePowerUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { name, description } = req.body

      const result = await this.createPowerUseCase.execute({
        userId: id,
        name,
        description,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.power)
    },
  ]
}
