import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { PowerAwakeningUseCase } from '../../use-cases/Power-Awakening/create-power-awakening'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'

export const powerAwakeningBodySchema = z.object({
  basePowerId: z.string(),
  awakenedPowerId: z.string(),
})

const validateBody = zodValidationPipe(powerAwakeningBodySchema)

export class PowerAwakeningController {
  constructor(private powerAwakeningUseCase: PowerAwakeningUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { basePowerId, awakenedPowerId } = req.body

      const result = await this.powerAwakeningUseCase.execute({
        userId: id,
        awakenedPowerId,
        basePowerId,
      })

      if (result.isLeft()) {
        const error = result.value

        if (error instanceof UnauthorizedError) {
          return res.status(401).json({ message: error.message })
        }

        if (error instanceof ResourceNotFoundError) {
          return res.status(404).json({ message: error.message })
        }

        if (error instanceof ResourceAlreadyExistError) {
          return res.status(409).json({ message: error.message })
        }

        return res.status(400).json({ message: error.message })
      }

      res.status(201).json(result.value.powerAwakening)
    },
  ]
}
