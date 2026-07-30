import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { MachineMember } from '../../../entities/machine-member'
import type { MachineMember as MachineMemberPrisma } from '../../../generated/prisma'

export class PrismaMachineMemberMapper {
  static toDomain(data: MachineMemberPrisma): MachineMember {
    return MachineMember.create(
      {
        machineId: data.machineId,
        characterId: data.characterId,
        positionRow: data.positionRow,
        positionCol: data.positionCol,
      },
      new UniqueEntityId(data.id)
    )
  }

  static toPrisma(machineMember: MachineMember) {
    return {
      id: machineMember.id.toString(),
      machineId: machineMember.machineId,
      characterId: machineMember.characterId,
      positionRow: machineMember.positionRow,
      positionCol: machineMember.positionCol,
    }
  }
}
