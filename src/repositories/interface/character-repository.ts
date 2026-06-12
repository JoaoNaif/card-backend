import type { Character } from '../../entities/character'

export interface ICharacterRepository {
  create(character: Character): Promise<void>
  save(character: Character): Promise<void>
  delete(character: Character): Promise<void>
  findById(id: string): Promise<Character | null>
  findByName(name: string): Promise<Character | null>
  findAll(search?: string, page?: number, limit?: number): Promise<Character[]>
  findManyByUserId(userId: string): Promise<Character[]>
  countByUserId(userId: string): Promise<number>
  assignTrait(characterId: string, traitId: string): Promise<void>
}
