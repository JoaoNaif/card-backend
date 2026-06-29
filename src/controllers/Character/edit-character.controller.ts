import z from 'zod'
import type { Request, Response } from 'express'
import { zodValidationPipe } from '../_pipe/zod-validation-pipe'
import type { EditCharacterUseCase } from '../../use-cases/Character/edit-character'

export const editCharacterBodySchema = z.object({
  characterId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
})

const validateBody = zodValidationPipe(editCharacterBodySchema)

export class EditCharacterController {
  constructor(private editCharacterUseCase: EditCharacterUseCase) {}

  handle = [
    validateBody,
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub
      const { name, description, characterId } = req.body

      const result = await this.editCharacterUseCase.execute({
        adminId: id,
        name,
        description,
        characterId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
