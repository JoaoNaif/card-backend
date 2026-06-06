import type { GetSkillUseCase } from '../../use-cases/Skill/get-skill'
import type { Request, Response } from 'express'

export class GetSkillController {
  constructor(private getSkillUseCase: GetSkillUseCase) {}

  async handle(req: Request<{ skillId: string }>, res: Response): Promise<Response> {
    const { skillId } = req.params

    const result = await this.getSkillUseCase.execute({ skillId })

    if (result.isLeft()) {
      return res.status(404).json({ message: result.value.message })
    }

    return res.status(200).json(result.value.skill)
  }
}
