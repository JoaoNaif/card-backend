import type { ICharacterRepository } from '../interface/character-repository'
import { prisma } from '../../config/prisma'
import type { Character } from '../../entities/character'
import { PrismaCharacterMapper } from './mappers/prisma-character-mapper'

export class PrismaCharacterRepository implements ICharacterRepository {
  async create(character: Character): Promise<void> {
    const data = PrismaCharacterMapper.toPrisma(character)
    await prisma.character.create({ data })
  }

  async save(character: Character): Promise<void> {
    const id = character.id.toString()
    await prisma.character.update({
      where: { id },
      data: PrismaCharacterMapper.toPrismaUpdate(character),
    })
  }

  async delete(character: Character): Promise<void> {
    const id = character.id.toString()
    await prisma.character.delete({ where: { id } })
  }

  async findById(id: string): Promise<Character | null> {
    const data = await prisma.character.findUnique({ where: { id } })
    if (!data) return null
    return PrismaCharacterMapper.toDomain(data)
  }

  async findByName(name: string): Promise<Character | null> {
    const data = await prisma.character.findUnique({ where: { name } })
    if (!data) return null
    return PrismaCharacterMapper.toDomain(data)
  }

  async findAll(search = '', page = 1, limit = 10): Promise<Character[]> {
    const data = await prisma.character.findMany({
      where: { name: { contains: search } },
      take: limit,
      skip: (page - 1) * limit,
    })
    return data.map(PrismaCharacterMapper.toDomain)
  }
}
