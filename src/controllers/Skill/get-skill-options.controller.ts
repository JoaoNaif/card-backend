import type { Request, Response } from 'express'
import type { GetSkillOptionsUseCase } from '../../use-cases/Skill/get-skill-options'

export class GetSkillOptionsController {
  constructor(private getSkillOptionsUseCase: GetSkillOptionsUseCase) {}

  handle = [
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const characterId = req.params['characterId'] as string

      const result = await this.getSkillOptionsUseCase.execute({
        userId,
        characterId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(200).json(result.value.options)
    },
  ]
}
