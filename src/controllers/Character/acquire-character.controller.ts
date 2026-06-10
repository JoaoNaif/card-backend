import z from 'zod'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { AcquireCharacterUseCase } from '../../use-cases/Character/acquire-character'
import type { Request, Response } from 'express'

export const acquireCharacterBodySchema = z.object({
  characterId: z.string(),
})

const validateBody = zodValidationPipe(acquireCharacterBodySchema)

export class AcquireCharacterController {
  constructor(private acquireCharacterUseCase: AcquireCharacterUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const { characterId } = req.body

      const result = await this.acquireCharacterUseCase.execute({
        userId,
        characterId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json('Acquire Character')
    },
  ]
}
