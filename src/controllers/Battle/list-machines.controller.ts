import type { Request, Response } from 'express'
import type { ListMachinesUseCase } from '../../use-cases/Battle/list-machines'

export class ListMachinesController {
  constructor(private listMachinesUseCase: ListMachinesUseCase) {}

  async handle(_req: Request, res: Response): Promise<Response> {
    const result = await this.listMachinesUseCase.execute()

    return res.status(200).json(result.value.machines)
  }
}
