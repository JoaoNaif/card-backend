import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { RunAutoBattleUseCase } from '../../use-cases/Battle/run-auto-battle'

const teamMemberSchema = z.object({
  characterId: z.string(),
  positionRow: z.number().int().min(0).max(2),
  positionCol: z.number().int().min(0).max(2),
})

const teamSchema = z.object({
  userId: z.string().optional(),
  members: z.array(teamMemberSchema).min(1).max(4),
})

const runAutoBattleBodySchema = z.object({
  team1: teamSchema,
  team2: teamSchema,
  battleFieldId: z.string().optional(),
  maxTurns: z.number().int().positive().optional(),
})

const validateBody = zodValidationPipe(runAutoBattleBodySchema)

export class RunAutoBattleController {
  constructor(private runAutoBattleUseCase: RunAutoBattleUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response) => {
      const { team1, team2, battleFieldId, maxTurns } = req.body

      const result = await this.runAutoBattleUseCase.execute({
        team1,
        team2,
        battleFieldId,
        maxTurns,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value)
    },
  ]
}
