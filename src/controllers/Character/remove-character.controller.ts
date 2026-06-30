import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import z from 'zod'
import type { RemoveCharacterUseCase } from '../../use-cases/Character/remove-character'

export const removeCharacterBodySchema = z.object({
  characterId: z.string(),
})

const validateBody = zodValidationPipe(removeCharacterBodySchema)

export class RemoveCharacterController {
  constructor(private removeCharacterUseCase: RemoveCharacterUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { characterId } = req.body

      const result = await this.removeCharacterUseCase.execute({
        adminId: id,
        characterId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
