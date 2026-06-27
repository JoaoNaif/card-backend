import type { Request, Response } from 'express'
import type { GetPowerNameUseCase } from '../../use-cases/Power/get-power-name'

export class GetPowerNameController {
  constructor(private getPowerNameUseCase: GetPowerNameUseCase) {}

  async handle(
    req: Request<{ name: string }>,
    res: Response
  ): Promise<Response> {
    const { name } = req.params

    const result = await this.getPowerNameUseCase.execute({ name })

    if (result.isLeft()) {
      return res.status(404).json({ message: result.value.message })
    }

    return res.status(200).json(result.value.power)
  }
}
