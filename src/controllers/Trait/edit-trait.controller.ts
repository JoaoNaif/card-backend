import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { EditTraitUseCase } from '../../use-cases/Trait/edit-trait'

export const editTraitBodySchema = z.object({
  traitId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
})

const validateBody = zodValidationPipe(editTraitBodySchema)

export class EditTraitController {
  constructor(private editTraitUseCase: EditTraitUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { traitId, name, description } = req.body

      const result = await this.editTraitUseCase.execute({
        adminId: id,
        traitId,
        name,
        description,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
