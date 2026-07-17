import type { Request, Response } from 'express'
import type { DiscardSkillOptionsUseCase } from '../../use-cases/Skill/discard-skill-options'

export class DiscardSkillOptionsController {
  constructor(
    private discardSkillOptionsUseCase: DiscardSkillOptionsUseCase
  ) {}

  handle = [
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const characterId = req.params['characterId'] as string

      const result = await this.discardSkillOptionsUseCase.execute({
        userId,
        characterId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(200).json('Skill options discarded')
    },
  ]
}
