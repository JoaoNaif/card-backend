import type { Request, Response } from 'express'
import type { GetMachineTeamUseCase } from '../../use-cases/Battle/get-machine-team'

export class GetMachineTeamController {
  constructor(private getMachineTeamUseCase: GetMachineTeamUseCase) {}

  async handle(
    req: Request<{ machineId: string }>,
    res: Response
  ): Promise<Response> {
    const { machineId } = req.params

    const result = await this.getMachineTeamUseCase.execute({ machineId })

    if (result.isLeft()) {
      return res.status(404).json({ message: result.value.message })
    }

    return res.status(200).json(result.value.machine)
  }
}
