import z from 'zod'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { Request, Response } from 'express'
import type { GainXpUseCase } from '../../use-cases/Character/gain-xp'

export const gainXpBodySchema = z.object({
  characterId: z.string(),
  xpAmount: z.number(),
})

const validateBody = zodValidationPipe(gainXpBodySchema)

export class GainXpController {
  constructor(private gainXpUseCase: GainXpUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const { characterId, xpAmount } = req.body

      const result = await this.gainXpUseCase.execute({
        xpAmount,
        characterId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value)
    },
  ]
}
