import type { Request, Response } from 'express'
import type { FetchSkillUseCase } from '../../use-cases/Skill/fetch-skill'

export class FetchSkillController {
  constructor(private fetchSkillUseCase: FetchSkillUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const { search, page, limit } = req.query
    const searchStr = (search as string) || ''
    const pageNum = page ? Number(page) : 1
    const limitNum = limit ? Number(limit) : 10

    const result = await this.fetchSkillUseCase.execute({
      search: searchStr,
      page: pageNum,
      limit: limitNum,
    })

    if (result.isLeft()) {
      return res.status(500).json()
    }

    return res.status(200).json(result.value.skills)
  }
}
