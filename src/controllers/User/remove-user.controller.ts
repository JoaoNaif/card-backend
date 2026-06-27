import type { Request, Response } from 'express'
import type { RemoveUserUseCase } from '../../use-cases/User/remove-user'

export class RemoveUserController {
  constructor(private removeUserUseCase: RemoveUserUseCase) {}

  handle = [
    async (req: Request, res: Response): Promise<void | Response> => {
      const id = req.user!.sub

      const result = await this.removeUserUseCase.execute({
        userId: id,
      })

      if (result.isLeft()) {
        return res.status(400).json({ message: result.value.message })
      }

      res.status(204).json(null)
    },
  ]
}
