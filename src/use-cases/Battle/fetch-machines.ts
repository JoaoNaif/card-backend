import { right, type Either } from '../../core/either'
import type { IMachineMemberRepository } from '../../repositories/interface/machine-member-repository'
import type { IMachineRepository } from '../../repositories/interface/machine-repository'
import type { DtoMachineRaw } from './dtos/dto-machine-raw'

type FetchMachinesUseCaseResponse = Either<null, { machines: DtoMachineRaw[] }>

export class FetchMachinesUseCase {
  constructor(
    private machineRepository: IMachineRepository,
    private machineMemberRepository: IMachineMemberRepository
  ) {}

  async execute(): Promise<FetchMachinesUseCaseResponse> {
    const machines = await this.machineRepository.findAll()

    const machinesRaw = await Promise.all(
      machines.map(async (machine) => {
        const members = await this.machineMemberRepository.findAllByMachineId(
          machine.id.toString()
        )

        return {
          id: machine.id.toString(),
          label: machine.label,
          name: machine.name,
          members: members.map((m) => ({
            characterId: m.characterId,
            positionRow: m.positionRow,
            positionCol: m.positionCol,
          })),
        }
      })
    )

    return right({ machines: machinesRaw })
  }
}
