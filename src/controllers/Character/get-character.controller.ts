import type { Request, Response } from 'express'
import type { GetCharacterUseCase } from '../../use-cases/Character/get-character'

export class GetCharacterController {
  constructor(private getCharacterUseCase: GetCharacterUseCase) {}

  async handle(
    req: Request<{ characterId: string }>,
    res: Response
  ): Promise<Response> {
    const { characterId } = req.params

    const result = await this.getCharacterUseCase.execute({ characterId })

    if (result.isLeft()) {
      return res.status(404).json({ message: result.value.message })
    }

    return res.status(200).json(result.value.character)
  }
}
