import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { ResolveSkillOptionUseCase } from '../../use-cases/Skill/resolve-skill-option'

export const resolveSkillOptionBodySchema = z.object({
  skillId: z.string(),
  currentSkillId: z.string().optional(),
})

const validateBody = zodValidationPipe(resolveSkillOptionBodySchema)

export class ResolveSkillOptionController {
  constructor(private resolveSkillOptionUseCase: ResolveSkillOptionUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const characterId = req.params['characterId'] as string
      const { skillId, currentSkillId } = req.body

      const result = await this.resolveSkillOptionUseCase.execute({
        userId,
        characterId,
        skillId,
        currentSkillId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.characterSkill)
    },
  ]
}
