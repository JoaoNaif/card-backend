import type { Request, Response } from 'express'
import type { FetchMachinesUseCase } from '../../use-cases/Battle/fetch-machines'

export class FetchMachinesController {
  constructor(private fetchMachinesUseCase: FetchMachinesUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const result = await this.fetchMachinesUseCase.execute()

    if (result.isLeft()) {
      return res.status(500).json()
    }

    return res.status(200).json(result.value.machines)
  }
}
