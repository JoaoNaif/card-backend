import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import { Skill, type SkillProps } from '../../entities/skill'
import type { ISkillRepository } from '../interface/skill-repository'
import {
  CATALOG_CACHE_TTL_SECONDS,
  cacheDelete,
  cacheGet,
  cacheSet,
  type SerializedEntity,
} from './cache'
import { characterSkillsKey } from './character-skills-cache-key'

type CachedSkill = SerializedEntity<Omit<SkillProps, 'createdAt'> & { createdAt: string }>

function skillKey(id: string): string {
  return `skill:${id}`
}

function revive(cached: CachedSkill): Skill {
  return Skill.create(
    { ...cached.props, createdAt: new Date(cached.props.createdAt) },
    new UniqueEntityId(cached.id)
  )
}

export class CachedSkillRepository implements ISkillRepository {
  constructor(private inner: ISkillRepository) {}

  findByName(name: string): Promise<Skill | null> {
    return this.inner.findByName(name)
  }

  findAll(search: string, page: number, limit: number): Promise<Skill[]> {
    return this.inner.findAll(search, page, limit)
  }

  findEligibleForCharacter(
    powerIds: string[],
    characterLevel: number,
    excludeSkillIds: string[]
  ): Promise<Skill[]> {
    return this.inner.findEligibleForCharacter(powerIds, characterLevel, excludeSkillIds)
  }

  async findById(id: string): Promise<Skill | null> {
    const cached = await cacheGet<CachedSkill>(skillKey(id))
    if (cached) return revive(cached)

    const skill = await this.inner.findById(id)
    if (skill) {
      await cacheSet(skillKey(id), skill.toJSON(), CATALOG_CACHE_TTL_SECONDS)
    }
    return skill
  }

  async findManyByCharacterIds(ids: string[]): Promise<Record<string, Skill[]>> {
    const result: Record<string, Skill[]> = {}
    const missingIds: string[] = []

    for (const id of ids) {
      const cached = await cacheGet<CachedSkill[]>(characterSkillsKey(id))
      if (cached) {
        result[id] = cached.map(revive)
      } else {
        missingIds.push(id)
      }
    }

    if (missingIds.length > 0) {
      const fetched = await this.inner.findManyByCharacterIds(missingIds)
      for (const id of missingIds) {
        const skills = fetched[id] ?? []
        result[id] = skills
        await cacheSet(
          characterSkillsKey(id),
          skills.map((skill) => skill.toJSON()),
          CATALOG_CACHE_TTL_SECONDS
        )
      }
    }

    return result
  }

  async create(skill: Skill): Promise<void> {
    await this.inner.create(skill)
  }

  async save(skill: Skill): Promise<void> {
    await this.inner.save(skill)
    await cacheDelete(skillKey(skill.id.toString()))
  }

  async delete(skill: Skill): Promise<void> {
    await this.inner.delete(skill)
    await cacheDelete(skillKey(skill.id.toString()))
  }
}
