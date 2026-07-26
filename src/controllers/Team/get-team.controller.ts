import type { Request, Response } from 'express'
import type { GetTeamUseCase } from '../../use-cases/Team/get-team'

export class GetTeamController {
  constructor(private getTeamUseCase: GetTeamUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.sub

    const result = await this.getTeamUseCase.execute({ userId })

    if (result.isLeft()) {
      return res.status(500).json()
    }

    return res.status(200).json(result.value.team)
  }
}
