import type { CreateCharacterUseCase } from '../../use-cases/Character/create-character'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import z from 'zod'
import { Ranking } from '../../entities/character'

export const createCharacterBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  ranking: z.enum(Object.values(Ranking) as [Ranking, ...Ranking[]]),
  maxRanking: z.enum(Object.values(Ranking) as [Ranking, ...Ranking[]]),
  level: z.number(),
  xp: z.number(),
  breakthroughAttempts: z.number(),
  baseHp: z.number(),
  baseAtk: z.number(),
  baseDef: z.number(),
  baseSpd: z.number(),
  powerId: z.string(),
})

const validateBody = zodValidationPipe(createCharacterBodySchema)

export class CreateCharacterController {
  constructor(private createPowerUseCase: CreateCharacterUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const {
        name,
        description,
        ranking,
        maxRanking,
        level,
        xp,
        breakthroughAttempts,
        baseHp,
        baseAtk,
        baseDef,
        baseSpd,
        powerId,
      } = req.body

      const result = await this.createPowerUseCase.execute({
        adminId: id,
        name,
        description,
        ranking,
        maxRanking,
        level,
        xp,
        breakthroughAttempts,
        baseAtk,
        baseSpd,
        baseDef,
        baseHp,
        powerId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.character)
    },
  ]
}
