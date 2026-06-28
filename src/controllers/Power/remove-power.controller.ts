import type { Request, Response } from 'express'
import type { RemovePowerUseCase } from '../../use-cases/Power/remove-power'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import z from 'zod'

export const removePowerBodySchema = z.object({
  powerId: z.string(),
})

const validateBody = zodValidationPipe(removePowerBodySchema)

export class RemovePowerController {
  constructor(private removePowerUseCase: RemovePowerUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { powerId } = req.body

      const result = await this.removePowerUseCase.execute({
        adminId: id,
        powerId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
