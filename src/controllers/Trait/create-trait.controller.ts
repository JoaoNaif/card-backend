import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { CreateTraitUseCase } from '../../use-cases/Trait/create-trait'

export const createTraitBodySchema = z.object({
  name: z.string(),
  description: z.string(),
})

const validateBody = zodValidationPipe(createTraitBodySchema)

export class CreateTraitController {
  constructor(private createTraitUseCase: CreateTraitUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { name, description } = req.body

      const result = await this.createTraitUseCase.execute({
        userId: id,
        name,
        description,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.trait)
    },
  ]
}
