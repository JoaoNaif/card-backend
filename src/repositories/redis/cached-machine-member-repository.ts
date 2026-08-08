import { MachineMember, type MachineMemberProps } from '../../entities/machine-member'
import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import type { IMachineMemberRepository } from '../interface/machine-member-repository'
import {
  CATALOG_CACHE_TTL_SECONDS,
  cacheDelete,
  cacheGet,
  cacheSet,
  type SerializedEntity,
} from './cache'

type CachedMachineMember = SerializedEntity<MachineMemberProps>

function membersKey(machineId: string): string {
  return `machine-members:${machineId}`
}

function revive(cached: CachedMachineMember): MachineMember {
  return MachineMember.create(cached.props, new UniqueEntityId(cached.id))
}

export class CachedMachineMemberRepository implements IMachineMemberRepository {
  constructor(private inner: IMachineMemberRepository) {}

  async create(machineMember: MachineMember): Promise<void> {
    await this.inner.create(machineMember)
    await cacheDelete(membersKey(machineMember.machineId))
  }

  async findAllByMachineId(machineId: string): Promise<MachineMember[]> {
    const cached = await cacheGet<CachedMachineMember[]>(membersKey(machineId))
    if (cached) return cached.map(revive)

    const members = await this.inner.findAllByMachineId(machineId)
    await cacheSet(
      membersKey(machineId),
      members.map((member) => member.toJSON()),
      CATALOG_CACHE_TTL_SECONDS
    )
    return members
  }
}
