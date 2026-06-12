import z from 'zod'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { Request, Response } from 'express'
import type { AssignTraitUseCase } from '../../use-cases/Character/assign-trait'

export const assignTraitBodySchema = z.object({
  characterId: z.string(),
  traitId: z.string(),
})

const validateBody = zodValidationPipe(assignTraitBodySchema)

export class AssignTraitController {
  constructor(private assignTraitUseCase: AssignTraitUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const { characterId, traitId } = req.body

      const result = await this.assignTraitUseCase.execute({
        userId,
        characterId,
        traitId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json('Assigned trait')
    },
  ]
}
