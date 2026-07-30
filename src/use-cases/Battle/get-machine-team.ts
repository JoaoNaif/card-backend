import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { IMachineMemberRepository } from '../../repositories/interface/machine-member-repository'
import type { IMachineRepository } from '../../repositories/interface/machine-repository'
import type { DtoMachineRaw } from './dtos/dto-machine-raw'

interface GetMachineTeamUseCaseRequest {
  machineId: string
}

type GetMachineTeamResponse = Either<
  ResourceNotFoundError,
  { machine: DtoMachineRaw }
>

export class GetMachineTeamUseCase {
  constructor(
    private machineRepository: IMachineRepository,
    private machineMemberRepository: IMachineMemberRepository
  ) {}

  async execute({
    machineId,
  }: GetMachineTeamUseCaseRequest): Promise<GetMachineTeamResponse> {
    const machine =
      (await this.machineRepository.findByLabel(machineId)) ??
      (await this.machineRepository.findById(machineId))

    if (!machine) return left(new ResourceNotFoundError('Machine'))

    const members = await this.machineMemberRepository.findAllByMachineId(
      machine.id.toString()
    )

    return right({
      machine: {
        id: machine.id.toString(),
        label: machine.label,
        name: machine.name,
        members: members.map((m) => ({
          characterId: m.characterId,
          positionRow: m.positionRow,
          positionCol: m.positionCol,
        })),
      },
    })
  }
}
