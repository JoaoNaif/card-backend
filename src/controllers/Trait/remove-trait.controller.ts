import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import z from 'zod'
import type { RemoveTraitUseCase } from '../../use-cases/Trait/remove-trait'

export const removeTraitBodySchema = z.object({
  traitId: z.string(),
})

const validateBody = zodValidationPipe(removeTraitBodySchema)

export class RemoveTraitController {
  constructor(private removeTraitUseCase: RemoveTraitUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { traitId } = req.body

      const result = await this.removeTraitUseCase.execute({
        adminId: id,
        traitId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
