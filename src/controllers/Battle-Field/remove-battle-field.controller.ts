import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import z from 'zod'
import type { RemoveBattleFieldUseCase } from '../../use-cases/Battle-Field/remove-battle-field'

export const removeBattleFieldBodySchema = z.object({
  battleFieldId: z.string(),
})

const validateBody = zodValidationPipe(removeBattleFieldBodySchema)

export class RemoveBattleFieldController {
  constructor(private removeBattleFieldUseCase: RemoveBattleFieldUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { battleFieldId } = req.body

      const result = await this.removeBattleFieldUseCase.execute({
        adminId: id,
        battleFieldId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
