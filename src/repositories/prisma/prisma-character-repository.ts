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
      include: { traits: { select: { id: true, name: true } } },
      take: limit,
      skip: (page - 1) * limit,
    })
    return data.map((item) => PrismaCharacterMapper.toDomain(item, item.traits))
  }

  async countByUserId(userId: string): Promise<number> {
    const length = await prisma.character.count({
      where: { userId },
    })

    return length
  }

  async findManyByIds(ids: string[]): Promise<Character[]> {
    const data = await prisma.character.findMany({
      where: { id: { in: ids } },
      include: { traits: { select: { id: true, name: true } } },
    })
    return data.map((item) => PrismaCharacterMapper.toDomain(item, item.traits))
  }

  async findManyByUserId(userId: string): Promise<Character[]> {
    const characters = await prisma.character.findMany({
      where: { userId },
      include: { traits: { select: { id: true, name: true } } },
    })

    return characters.map((item) =>
      PrismaCharacterMapper.toDomain(item, item.traits)
    )
  }

  async assignTrait(characterId: string, traitId: string): Promise<void> {
    await prisma.character.update({
      where: { id: characterId },
      data: { traits: { connect: { id: traitId } } },
    })
  }
}
