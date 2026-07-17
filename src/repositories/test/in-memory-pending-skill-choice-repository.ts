import type { PendingSkillChoice } from '../../entities/pending-skill-choice'
import type { IPendingSkillChoiceRepository } from '../interface/pending-skill-choice-repository'

export class InMemoryPendingSkillChoiceRepository
  implements IPendingSkillChoiceRepository
{
  public items: PendingSkillChoice[] = []

  async create(pendingSkillChoice: PendingSkillChoice): Promise<void> {
    this.items.push(pendingSkillChoice)
  }

  async save(pendingSkillChoice: PendingSkillChoice): Promise<void> {
    const index = this.items.findIndex((p) =>
      p.id.equals(pendingSkillChoice.id)
    )

    if (index >= 0) this.items[index] = pendingSkillChoice
  }

  async findOpenByCharacterId(
    characterId: string
  ): Promise<PendingSkillChoice | null> {
    return (
      this.items.find(
        (p) => p.characterId === characterId && !p.resolvedAt
      ) ?? null
    )
  }
}
