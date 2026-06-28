import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import z from 'zod'
import type { RemoveSkillUseCase } from '../../use-cases/Skill/remove-skill'

export const removeSkillBodySchema = z.object({
  skillId: z.string(),
})

const validateBody = zodValidationPipe(removeSkillBodySchema)

export class RemoveSkillController {
  constructor(private removeSkillUseCase: RemoveSkillUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { skillId } = req.body

      const result = await this.removeSkillUseCase.execute({
        adminId: id,
        skillId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
