import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { AiDifficulty, AiPersonality, Machine } from '../../entities/machine'
import { MachineMember } from '../../entities/machine-member'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IMachineMemberRepository } from '../../repositories/interface/machine-member-repository'
import type { IMachineRepository } from '../../repositories/interface/machine-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoMachineRaw } from './dtos/dto-machine-raw'
import { InvalidTeamCompositionError } from './err/invalid-team-composition-error'
import { validateTeamComposition, type TeamMemberInput } from './run-auto-battle'

interface CreateMachineUseCaseRequest {
  userId: string
  label: string
  name: string
  difficulty?: AiDifficulty
  personality?: AiPersonality
  members: TeamMemberInput[]
}

type CreateMachineUseCaseResponse = Either<
  | ResourceNotFoundError
  | UnauthorizedError
  | InvalidTeamCompositionError
  | ResourceAlreadyExistError,
  { machine: DtoMachineRaw }
>

export class CreateMachineUseCase {
  constructor(
    private machineRepository: IMachineRepository,
    private machineMemberRepository: IMachineMemberRepository,
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    userId,
    label,
    name,
    difficulty,
    personality,
    members,
  }: CreateMachineUseCaseRequest): Promise<CreateMachineUseCaseResponse> {
    const user = await this.userRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError('User'))
    if (!user.isAdmin()) return left(new UnauthorizedError())

    const compositionError = validateTeamComposition(members, 'Machine')
    if (compositionError) return left(compositionError)

    const machineAlreadyExists = await this.machineRepository.findByLabel(label)
    if (machineAlreadyExists) {
      return left(new ResourceAlreadyExistError('Machine'))
    }

    const characters = await this.characterRepository.findManyByIds(
      members.map((m) => m.characterId)
    )
    for (const member of members) {
      if (!characters.find((c) => c.id.toString() === member.characterId)) {
        return left(new ResourceNotFoundError('Character'))
      }
    }

    const machine = Machine.create({
      label,
      name,
      ...(difficulty !== undefined ? { difficulty } : {}),
      ...(personality !== undefined ? { personality } : {}),
    })
    await this.machineRepository.create(machine)

    for (const member of members) {
      const machineMember = MachineMember.create({
        machineId: machine.id.toString(),
        characterId: member.characterId,
        positionRow: member.positionRow,
        positionCol: member.positionCol,
      })
      await this.machineMemberRepository.create(machineMember)
    }

    return right({
      machine: {
        id: machine.id.toString(),
        label: machine.label,
        name: machine.name,
        difficulty: machine.difficulty,
        personality: machine.personality,
        members: members.map((m) => ({
          characterId: m.characterId,
          positionRow: m.positionRow,
          positionCol: m.positionCol,
        })),
      },
    })
  }
}
