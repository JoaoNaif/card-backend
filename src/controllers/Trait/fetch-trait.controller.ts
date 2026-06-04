import type { Request, Response } from 'express'
import type { FetchTraitUseCase } from '../../use-cases/Trait/fetch-trait'

export class FetchTraitController {
  constructor(private fetchTraitUseCase: FetchTraitUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const id = req.user!.sub
    const { search, page, limit } = req.query
    const searchStr = (search as string) || ''
    const pageNum = page ? Number(page) : 1
    const limitNum = limit ? Number(limit) : 10

    const result = await this.fetchTraitUseCase.execute({
      userId: id,
      search: searchStr,
      page: pageNum,
      limit: limitNum,
    })

    if (result.isLeft()) {
      return res.status(404).json({ message: result.value.message })
    }

    return res.status(200).json(result.value.traits)
  }
}
