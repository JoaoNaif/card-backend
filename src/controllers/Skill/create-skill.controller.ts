import type { CreateSkillUseCase } from '../../use-cases/Skill/create-skill'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import z from 'zod'

export const createSkillBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  limitation: z.string(),
  cost: z.number(),
  minLevel: z.number(),
  powerId: z.string(),
})

const validateBody = zodValidationPipe(createSkillBodySchema)

export class CreateSkillController {
  constructor(private createPowerUseCase: CreateSkillUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { name, description, limitation, cost, minLevel, powerId } =
        req.body

      const result = await this.createPowerUseCase.execute({
        userId: id,
        name,
        description,
        limitation,
        cost,
        minLevel,
        powerId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.skill)
    },
  ]
}
