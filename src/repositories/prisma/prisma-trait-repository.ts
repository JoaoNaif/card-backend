import { prisma } from '../../config/prisma'
import type { Trait } from '../../entities/trait'
import type { ITraitRepository } from '../interface/trait-repository'
import { PrismaTraitMapper } from './mappers/prisma-trait-mapper'

export class PrismaTraitRepository implements ITraitRepository {
  async create(trait: Trait): Promise<void> {
    const data = PrismaTraitMapper.toPrisma(trait)

    await prisma.trait.create({
      data,
    })
  }

  async save(trait: Trait): Promise<void> {
    const id = trait.id.toString()
    await prisma.trait.update({
      where: { id },
      data: PrismaTraitMapper.toPrismaUpdate(trait),
    })
  }

  async delete(trait: Trait): Promise<void> {
    const id = trait.id.toString()
    await prisma.trait.delete({
      where: { id },
    })
  }

  async findById(id: string): Promise<Trait | null> {
    const data = await prisma.trait.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return PrismaTraitMapper.toDomain(data)
  }

  async findByName(name: string): Promise<Trait | null> {
    const data = await prisma.trait.findUnique({
      where: { name },
    })

    if (!data) {
      return null
    }

    return PrismaTraitMapper.toDomain(data)
  }
}
