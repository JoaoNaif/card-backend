import z from 'zod'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { Request, Response } from 'express'
import type { SwapSkillUseCase } from '../../use-cases/Skill/swap-skill'

export const swapSkillBodySchema = z.object({
  characterId: z.string(),
  currentSkillId: z.string(),
  newSkillId: z.string(),
})

const validateBody = zodValidationPipe(swapSkillBodySchema)

export class SwapSkillController {
  constructor(private swapSkillUseCase: SwapSkillUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const { characterId, currentSkillId, newSkillId } = req.body

      const result = await this.swapSkillUseCase.execute({
        userId,
        characterId,
        currentSkillId,
        newSkillId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json('Swap Skill')
    },
  ]
}
