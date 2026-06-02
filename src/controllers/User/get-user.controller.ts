import type { GetUserUseCase } from '../../use-cases/User/get-user'
import type { Request, Response } from 'express'

export class GetUserController {
  constructor(private getUserUseCase: GetUserUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const id = req.user!.sub

    const result = await this.getUserUseCase.execute({ id })

    if (result.isLeft()) {
      return res.status(404).json({ message: result.value.message })
    }

    return res.status(200).json(result.value.user)
  }
}
