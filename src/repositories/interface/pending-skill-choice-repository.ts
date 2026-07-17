import type { PendingSkillChoice } from '../../entities/pending-skill-choice'

export interface IPendingSkillChoiceRepository {
  create(pendingSkillChoice: PendingSkillChoice): Promise<void>
  save(pendingSkillChoice: PendingSkillChoice): Promise<void>
  findOpenByCharacterId(
    characterId: string
  ): Promise<PendingSkillChoice | null>
}
