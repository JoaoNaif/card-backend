import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { IMachineMemberRepository } from '../../repositories/interface/machine-member-repository'
import type { IMachineRepository } from '../../repositories/interface/machine-repository'
import type { GetCharacterUseCase } from '../Character/get-character'
import type { DtoMachineMemberFull, DtoMachineFull } from './dtos/dto-machine-raw'

interface GetMachineTeamUseCaseRequest {
  machineId: string
}

type GetMachineTeamResponse = Either<
  ResourceNotFoundError,
  { machine: DtoMachineFull }
>

export class GetMachineTeamUseCase {
  constructor(
    private machineRepository: IMachineRepository,
    private machineMemberRepository: IMachineMemberRepository,
    private getCharacterUseCase: GetCharacterUseCase
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

    const memberDtos: DtoMachineMemberFull[] = []

    for (const m of members) {
      const result = await this.getCharacterUseCase.execute({
        characterId: m.characterId,
      })

      if (result.isLeft()) return left(result.value)

      memberDtos.push({
        characterId: m.characterId,
        positionRow: m.positionRow,
        positionCol: m.positionCol,
        character: result.value.character,
      })
    }

    return right({
      machine: {
        id: machine.id.toString(),
        label: machine.label,
        name: machine.name,
        difficulty: machine.difficulty,
        personality: machine.personality,
        members: memberDtos,
      },
    })
  }
}
