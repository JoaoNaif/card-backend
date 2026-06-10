import z from 'zod'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { SwapCharacterUseCase } from '../../use-cases/Character/swap-character'
import type { Request, Response } from 'express'

export const swapCharacterBodySchema = z.object({
  removeCharacterId: z.string(),
  newCharacterId: z.string(),
})

const validateBody = zodValidationPipe(swapCharacterBodySchema)

export class SwapCharacterController {
  constructor(private swapCharacterUseCase: SwapCharacterUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const { removeCharacterId, newCharacterId } = req.body

      const result = await this.swapCharacterUseCase.execute({
        userId,
        removeCharacterId,
        newCharacterId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json('Swap Character')
    },
  ]
}
