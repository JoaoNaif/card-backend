import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { EditBattleFieldUseCase } from '../../use-cases/Battle-Field/edit-battle-field'

export const editBattleFieldBodySchema = z.object({
  battleFieldId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
})

const validateBody = zodValidationPipe(editBattleFieldBodySchema)

export class EditBattleFieldController {
  constructor(private editBattleFieldUseCase: EditBattleFieldUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { battleFieldId, name, description } = req.body

      const result = await this.editBattleFieldUseCase.execute({
        adminId: id,
        name,
        description,
        battleFieldId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
