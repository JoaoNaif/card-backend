import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { EditPowerUseCase } from '../../use-cases/Power/edit-power'
import { Pillar } from '../../entities/power'

export const editPowerBodySchema = z.object({
  powerId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  pillar: z.enum(Object.values(Pillar) as [Pillar, ...Pillar[]]).optional(),
})

const validateBody = zodValidationPipe(editPowerBodySchema)

export class EditPowerController {
  constructor(private editPowerUseCase: EditPowerUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { powerId, name, description, pillar } = req.body

      const result = await this.editPowerUseCase.execute({
        adminId: id,
        name,
        description,
        powerId,
        pillar,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
