import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import { StatType, TargetType } from '../../entities/skill'
import type { EditSkillUseCase } from '../../use-cases/Skill/edit-skill'

export const editSkillBodySchema = z.object({
  skillId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  limitation: z.string().optional(),
  cooldownTurns: z.number().optional(),
  debuffStat: z
    .enum(Object.values(StatType) as [StatType, ...StatType[]])
    .optional(),
  debuffValue: z.number().optional(),
  debuffDuration: z.number().optional(),
  targetType: z
    .enum(Object.values(TargetType) as [TargetType, ...TargetType[]])
    .optional(),
  damageMultiplier: z.number().optional(),
  healMultiplier: z.number().optional(),
  targetEffectStat: z
    .enum(Object.values(StatType) as [StatType, ...StatType[]])
    .optional(),
  targetEffectValue: z.number().optional(),
  targetEffectDuration: z.number().optional(),
  minLevel: z.number().optional(),
  powerId: z.string().optional(),
  appliesBattleFieldId: z.string().optional(),
  fieldDuration: z.number().optional(),
})

const validateBody = zodValidationPipe(editSkillBodySchema)

export class EditSkillController {
  constructor(private editSkillUseCase: EditSkillUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const {
        skillId,
        powerId,
        name,
        description,
        limitation,
        cooldownTurns,
        debuffStat,
        debuffValue,
        debuffDuration,
        targetType,
        damageMultiplier,
        healMultiplier,
        targetEffectStat,
        targetEffectValue,
        targetEffectDuration,
        minLevel,
        appliesBattleFieldId,
        fieldDuration,
      } = req.body

      const result = await this.editSkillUseCase.execute({
        adminId: id,
        skillId,
        name,
        description,
        powerId,
        limitation,
        cooldownTurns,
        debuffStat,
        debuffValue,
        debuffDuration,
        targetType,
        damageMultiplier,
        healMultiplier,
        targetEffectStat,
        targetEffectValue,
        targetEffectDuration,
        minLevel,
        appliesBattleFieldId,
        fieldDuration,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
