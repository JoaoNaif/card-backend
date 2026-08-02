import type { Request, Response } from 'express'
import type { ListBattleHistoryUseCase } from '../../use-cases/Battle/list-battle-history'

export class ListBattleHistoryController {
  constructor(private listBattleHistoryUseCase: ListBattleHistoryUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.sub

    const result = await this.listBattleHistoryUseCase.execute({ userId })

    return res.status(200).json(result.value)
  }
}
