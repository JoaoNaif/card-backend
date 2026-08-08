import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import { Character, type CharacterProps } from '../../entities/character'
import type { ICharacterRepository } from '../interface/character-repository'
import {
  USER_SCOPED_CACHE_TTL_SECONDS,
  cacheDelete,
  cacheGet,
  cacheSet,
  type SerializedEntity,
} from './cache'

type CachedCharacter = SerializedEntity<
  Omit<CharacterProps, 'createdAt'> & { createdAt: string }
>

function rosterKey(userId: string): string {
  return `roster:${userId}`
}

function revive(cached: CachedCharacter): Character {
  return Character.create(
    { ...cached.props, createdAt: new Date(cached.props.createdAt) },
    new UniqueEntityId(cached.id)
  )
}

export class CachedCharacterRepository implements ICharacterRepository {
  constructor(private inner: ICharacterRepository) {}

  findById(id: string): Promise<Character | null> {
    return this.inner.findById(id)
  }

  findByName(name: string): Promise<Character | null> {
    return this.inner.findByName(name)
  }

  findAll(search?: string, page?: number, limit?: number): Promise<Character[]> {
    return this.inner.findAll(search, page, limit)
  }

  findManyByIds(ids: string[]): Promise<Character[]> {
    return this.inner.findManyByIds(ids)
  }

  countByUserId(userId: string): Promise<number> {
    return this.inner.countByUserId(userId)
  }

  async findManyByUserId(userId: string): Promise<Character[]> {
    const cached = await cacheGet<CachedCharacter[]>(rosterKey(userId))
    if (cached) return cached.map(revive)

    const characters = await this.inner.findManyByUserId(userId)
    await cacheSet(
      rosterKey(userId),
      characters.map((character) => character.toJSON()),
      USER_SCOPED_CACHE_TTL_SECONDS
    )
    return characters
  }

  async create(character: Character): Promise<void> {
    await this.inner.create(character)
    await this.invalidateRosterFor(character.userId)
  }

  async save(character: Character): Promise<void> {
    await this.inner.save(character)
    await this.invalidateRosterFor(character.userId)
  }

  async delete(character: Character): Promise<void> {
    await this.inner.delete(character)
    await this.invalidateRosterFor(character.userId)
  }

  async assignTrait(characterId: string, traitId: string): Promise<void> {
    await this.inner.assignTrait(characterId, traitId)
    const character = await this.inner.findById(characterId)
    await this.invalidateRosterFor(character?.userId)
  }

  private async invalidateRosterFor(userId: string | null | undefined): Promise<void> {
    if (!userId) return
    await cacheDelete(rosterKey(userId))
  }
}
