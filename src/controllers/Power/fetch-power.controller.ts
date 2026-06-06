import type { Request, Response } from 'express'
import type { FetchPowerUseCase } from '../../use-cases/Power/fetch-power'

export class FetchPowerController {
  constructor(private fetchPowerUseCase: FetchPowerUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const { search, page, limit } = req.query
    const searchStr = (search as string) || ''
    const pageNum = page ? Number(page) : 1
    const limitNum = limit ? Number(limit) : 10

    const result = await this.fetchPowerUseCase.execute({
      search: searchStr,
      page: pageNum,
      limit: limitNum,
    })

    if (result.isLeft()) {
      return res.status(500).json()
    }

    return res.status(200).json(result.value.powers)
  }
}
