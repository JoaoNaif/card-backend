import type { CreateSkillUseCase } from '../../use-cases/Skill/create-skill'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import z from 'zod'
import { StatType } from '../../entities/skill'

export const createSkillBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  limitation: z.string(),
  cooldownTurns: z.number(),
  debuffStat: z.enum(Object.values(StatType) as [StatType, ...StatType[]]),
  debuffValue: z.number(),
  debuffDuration: z.number(),
  appliesBattleFieldId: z.string().optional(),
  fieldDuration: z.number().optional(),
  minLevel: z.number(),
  powerId: z.string(),
})

const validateBody = zodValidationPipe(createSkillBodySchema)

export class CreateSkillController {
  constructor(private createPowerUseCase: CreateSkillUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const {
        name,
        description,
        limitation,
        minLevel,
        powerId,
        cooldownTurns,
        debuffStat,
        debuffDuration,
        debuffValue,
        appliesBattleFieldId,
        fieldDuration,
      } = req.body

      const result = await this.createPowerUseCase.execute({
        userId: id,
        name,
        description,
        limitation,
        cooldownTurns,
        debuffStat,
        debuffDuration,
        debuffValue,
        appliesBattleFieldId,
        fieldDuration,
        minLevel,
        powerId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.skill)
    },
  ]
}
