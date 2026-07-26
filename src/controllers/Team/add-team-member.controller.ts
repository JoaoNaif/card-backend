import type { Request, Response } from 'express'
import z from 'zod'
import type { AddTeamMemberUseCase } from '../../use-cases/Team/add-team-member'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'

export const addTeamMemberBodySchema = z.object({
  characterId: z.string(),
  positionRow: z.number(),
  positionCol: z.number(),
})

const validateBody = zodValidationPipe(addTeamMemberBodySchema)

export class AddTeamMemberController {
  constructor(private addTeamMemberUseCase: AddTeamMemberUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const { characterId, positionRow, positionCol } = req.body

      const result = await this.addTeamMemberUseCase.execute({
        userId,
        characterId,
        positionRow,
        positionCol,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(201).json(result.value.teamMember)
    },
  ]
}
