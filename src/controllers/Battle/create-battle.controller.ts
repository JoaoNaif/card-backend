import z from 'zod'
import type { Request, Response } from 'express'
import { BattleMode } from '../../entities/battle'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { CreateBattleUseCase } from '../../use-cases/Battle/create-battle'

const createBattleBodySchema = z.object({
  mode: z.enum(Object.values(BattleMode) as [BattleMode, ...BattleMode[]]),
  battleFieldId: z.string(),
  winnerTerm: z.number().nullable().optional(),
  totalTurns: z.number().nullable().optional(),
  maxTurns: z.number().nullable().optional(),
  log: z.string().array().optional(),
  sessionState: z.string().array().nullable().optional(),
})

const validateBody = zodValidationPipe(createBattleBodySchema)

export class CreateBattleController {
  constructor(private createBattleUseCase: CreateBattleUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response) => {
      const {
        mode,
        battleFieldId,
        winnerTerm,
        totalTurns,
        maxTurns,
        log,
        sessionState,
      } = req.body

      const result = await this.createBattleUseCase.execute({
        mode,
        battleFieldId,
        log,
        maxTurns,
        sessionState,
        totalTurns,
        winnerTerm,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.battle)
    },
  ]
}
