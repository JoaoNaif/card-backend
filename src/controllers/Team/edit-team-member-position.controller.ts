import type { Request, Response } from 'express'
import z from 'zod'
import type { EditTeamMemberPositionUseCase } from '../../use-cases/Team/edit-team-member-position'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'

export const editTeamMemberPositionBodySchema = z.object({
  characterId: z.string(),
  positionRow: z.number(),
  positionCol: z.number(),
})

const validateBody = zodValidationPipe(editTeamMemberPositionBodySchema)

export class EditTeamMemberPositionController {
  constructor(
    private editTeamMemberPositionUseCase: EditTeamMemberPositionUseCase
  ) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub
      const { characterId, positionRow, positionCol } = req.body

      const result = await this.editTeamMemberPositionUseCase.execute({
        userId,
        characterId,
        positionRow,
        positionCol,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(200).json(result.value.teamMember)
    },
  ]
}