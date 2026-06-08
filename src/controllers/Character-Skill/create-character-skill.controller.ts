import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { CreateCharacterSkillUseCase } from '../../use-cases/Character-Skill/create-character-skill'

export const createCharacterSkillBodySchema = z.object({
  characterId: z.string().min(1),
  skillId: z.string().min(1),
})

const validateBody = zodValidationPipe(createCharacterSkillBodySchema)

export class CreateCharacterSkillController {
  constructor(
    private createCharacterSkillUseCase: CreateCharacterSkillUseCase
  ) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const { characterId, skillId } = req.body

      const result = await this.createCharacterSkillUseCase.execute({
        userId,
        characterId,
        skillId,
        assignedAt: new Date(),
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.characterSkill)
    },
  ]
}
