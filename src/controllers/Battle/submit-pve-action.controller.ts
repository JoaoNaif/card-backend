import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { SubmitPveActionUseCase } from '../../use-cases/Battle/submit-pve-action'

const submitPveActionBodySchema = z.object({
  characterId: z.string(),
  skillId: z.string(),
  targetId: z.string().optional(),
})

const validateBody = zodValidationPipe(submitPveActionBodySchema)

export class SubmitPveActionController {
  constructor(private submitPveActionUseCase: SubmitPveActionUseCase) {}

  handle = [
    validateBody,
    async (req: Request<{ battleId: string }>, res: Response) => {
      const userId = req.user!.sub
      const { battleId } = req.params
      const { characterId, skillId, targetId } = req.body

      const result = await this.submitPveActionUseCase.execute({
        userId,
        battleId,
        characterId,
        skillId,
        targetId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(200).json(result.value)
    },
  ]
}
