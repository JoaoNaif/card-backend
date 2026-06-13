import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import z from 'zod'
import { BonusType, StatType } from '../../generated/prisma'
import type { CreateBattleFieldUseCase } from '../../use-cases/BattleField/create-battle-field'

const modifierSchema = z.object({
  traitId: z.string(),
  stat: z.enum(Object.values(StatType) as [string, ...string[]]),
  bonusType: z.enum(Object.values(BonusType) as [string, ...string[]]),
  bonusValue: z.number(),
})

export const createBattleFieldBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  modifiers: z.array(modifierSchema).default([]),
})

const validateBody = zodValidationPipe(createBattleFieldBodySchema)

export class CreateBattleFieldController {
  constructor(private createBattleFieldUseCase: CreateBattleFieldUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const { name, description, modifiers } = req.body

      const result = await this.createBattleFieldUseCase.execute({
        userId,
        name,
        description,
        modifiers,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.battleField)
    },
  ]
}
