import type { Request, Response } from 'express'
import z from 'zod'
import type { RemoveTeamMemberUseCase } from '../../use-cases/Team/remove-team-member'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'

export const removeTeamMemberBodySchema = z.object({
  characterId: z.string(),
})

const validateBody = zodValidationPipe(removeTeamMemberBodySchema)

export class RemoveTeamMemberController {
  constructor(private removeTeamMemberUseCase: RemoveTeamMemberUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const { characterId } = req.body

      const result = await this.removeTeamMemberUseCase.execute({
        userId,
        characterId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
