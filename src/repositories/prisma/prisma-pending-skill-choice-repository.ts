import { prisma } from '../../config/prisma'
import type { PendingSkillChoice } from '../../entities/pending-skill-choice'
import type { IPendingSkillChoiceRepository } from '../interface/pending-skill-choice-repository'
import { PrismaPendingSkillChoiceMapper } from './mappers/prisma-pending-skill-choice-mapper'

export class PrismaPendingSkillChoiceRepository
  implements IPendingSkillChoiceRepository
{
  async create(pendingSkillChoice: PendingSkillChoice): Promise<void> {
    await prisma.pendingSkillChoice.create({
      data: PrismaPendingSkillChoiceMapper.toPrisma(pendingSkillChoice),
    })
  }

  async save(pendingSkillChoice: PendingSkillChoice): Promise<void> {
    await prisma.pendingSkillChoice.update({
      where: { id: pendingSkillChoice.id.toString() },
      data: PrismaPendingSkillChoiceMapper.toPrisma(pendingSkillChoice),
    })
  }

  async findOpenByCharacterId(
    characterId: string
  ): Promise<PendingSkillChoice | null> {
    const raw = await prisma.pendingSkillChoice.findFirst({
      where: { characterId, resolvedAt: null },
    })

    if (!raw) return null

    return PrismaPendingSkillChoiceMapper.toDomain(raw)
  }
}
