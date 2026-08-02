import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { StartPveBattleUseCase } from '../../use-cases/Battle/start-pve-battle'

const teamMemberSchema = z.object({
  characterId: z.string(),
  positionRow: z.number().int().min(0).max(2),
  positionCol: z.number().int().min(0).max(2),
})

const startPveBattleBodySchema = z.object({
  machineId: z.string(),
  playerTeam: z.array(teamMemberSchema).min(1).max(4),
  battleFieldId: z.string().optional().nullable(),
  maxTurns: z.number().int().positive().optional().nullable(),
})

const validateBody = zodValidationPipe(startPveBattleBodySchema)

export class StartPveBattleController {
  constructor(private startPveBattleUseCase: StartPveBattleUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response) => {
      const userId = req.user!.sub
      const { machineId, playerTeam, battleFieldId, maxTurns } = req.body

      const result = await this.startPveBattleUseCase.execute({
        userId,
        machineId,
        playerTeam,
        battleFieldId: battleFieldId ?? undefined,
        maxTurns: maxTurns ?? undefined,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value)
    },
  ]
}
