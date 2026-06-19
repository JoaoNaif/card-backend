import type { Request, Response } from 'express'
import type { FetchCharacterRosterUserUseCase } from '../../use-cases/Character/fetch-character-roster-user'

export class FetchCharacterRosterUserController {
  constructor(
    private fetchCharacterRosterUserUseCase: FetchCharacterRosterUserUseCase
  ) {}

  handle = [
    async (req: Request, res: Response): Promise<void | Response> => {
      const userId = req.user!.sub

      const result = await this.fetchCharacterRosterUserUseCase.execute({
        userId,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(200).json(result.value.characters)
    },
  ]
}
