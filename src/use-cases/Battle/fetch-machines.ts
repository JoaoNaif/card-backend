import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IMachineMemberRepository } from '../../repositories/interface/machine-member-repository'
import type { IMachineRepository } from '../../repositories/interface/machine-repository'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { DtoPowerRaw } from '../Power/dtos/dto-power-raw'
import type { DtoMachineMemberSummary, DtoMachineSummary } from './dtos/dto-machine-raw'

type FetchMachinesUseCaseResponse = Either<
  ResourceNotFoundError,
  { machines: DtoMachineSummary[] }
>

export class FetchMachinesUseCase {
  constructor(
    private machineRepository: IMachineRepository,
    private machineMemberRepository: IMachineMemberRepository,
    private characterRepository: ICharacterRepository,
    private powerRepository: IPowerRepository
  ) {}

  async execute(): Promise<FetchMachinesUseCaseResponse> {
    const machines = await this.machineRepository.findAll()
    const powerCache = new Map<string, DtoPowerRaw>()

    const machinesRaw: DtoMachineSummary[] = []

    for (const machine of machines) {
      const members = await this.machineMemberRepository.findAllByMachineId(
        machine.id.toString()
      )

      const characters = await this.characterRepository.findManyByIds(
        members.map((m) => m.characterId)
      )
      const characterById = new Map(
        characters.map((c) => [c.id.toString(), c])
      )

      const memberDtos: DtoMachineMemberSummary[] = []

      for (const m of members) {
        const character = characterById.get(m.characterId)
        if (!character) return left(new ResourceNotFoundError('Character'))

        let power = powerCache.get(character.powerId)
        if (!power) {
          const powerEntity = await this.powerRepository.findById(
            character.powerId
          )
          if (!powerEntity) return left(new ResourceNotFoundError('Power'))

          power = {
            id: powerEntity.id.toString(),
            name: powerEntity.name,
            description: powerEntity.description,
            pillar: powerEntity.pillar,
            canAwaken: powerEntity.canAwaken,
            isAwakened: powerEntity.isAwakened,
            createdAt: powerEntity.createdAt,
          }
          powerCache.set(character.powerId, power)
        }

        memberDtos.push({
          characterId: m.characterId,
          positionRow: m.positionRow,
          positionCol: m.positionCol,
          character: {
            id: character.id.toString(),
            name: character.name,
            level: character.level,
            ranking: character.ranking,
            maxRanking: character.maxRanking,
            hp: character.effectiveHp,
            atk: character.effectiveAtk,
            def: character.effectiveDef,
            spd: character.effectiveSpd,
            power,
          },
        })
      }

      machinesRaw.push({
        id: machine.id.toString(),
        label: machine.label,
        name: machine.name,
        difficulty: machine.difficulty,
        personality: machine.personality,
        members: memberDtos,
      })
    }

    return right({ machines: machinesRaw })
  }
}
